package com.franck.ecommerce.order;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.franck.ecommerce.customer.CustomerClient;
import com.franck.ecommerce.customer.CustomerResponse;
import com.franck.ecommerce.exception.BusinessException;
import com.franck.ecommerce.kafka.OrderConfirmation;
import com.franck.ecommerce.kafka.OrderProducer;
import com.franck.ecommerce.orderline.OrderLineService;
import com.franck.ecommerce.payment.PaymentClient;
import com.franck.ecommerce.payment.PaymentRequest;
import com.franck.ecommerce.product.ProductClient;
import com.franck.ecommerce.product.PurchaseRequest;
import com.franck.ecommerce.product.PurchaseResponse;
import jakarta.persistence.EntityNotFoundException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository repository;
    @Mock
    private CustomerClient customerClient;
    @Mock
    private PaymentClient paymentClient;
    @Mock
    private ProductClient productClient;
    @Mock
    private OrderLineService orderLineService;
    @Mock
    private OrderProducer orderProducer;

    private final OrderMapper mapper = new OrderMapper();

    private OrderService service;

    private static final CustomerResponse CUSTOMER = new CustomerResponse("customer-1", "Paul", "Client", "paul@kshop.com");

    @BeforeEach
    void setUp() {
        service = new OrderService(repository, mapper, customerClient, paymentClient, productClient, orderLineService, orderProducer);
    }

    private void stubRepositorySaveAssignsId42() {
        when(repository.save(any(Order.class))).thenAnswer(invocation -> {
            Order o = invocation.getArgument(0);
            if (o.getId() == null) o.setId(42);
            return o;
        });
    }

    private static OrderRequest requestWithReference(String reference) {
        return new OrderRequest(
                null, reference, BigDecimal.valueOf(59.98), PaymentMethod.CREDIT_CARD, "customer-1",
                List.of(new PurchaseRequest(1, 2.0)));
    }

    @Test
    void createOrder_withCustomerFound_purchasesProductsAndRequestsPaymentAndSavesOrder() {
        stubRepositorySaveAssignsId42();
        var request = requestWithReference("ORD-FIXED");
        when(customerClient.findCustomerById("customer-1")).thenReturn(Optional.of(CUSTOMER));
        var purchased = List.of(new PurchaseResponse(1, "Keyboard", "desc", BigDecimal.valueOf(29.99), 2.0));
        when(productClient.purchaseProducts(request.products())).thenReturn(purchased);

        var orderId = service.createOrder(request);

        assertThat(orderId).isEqualTo(42);
        verify(orderLineService).saveOrderLine(any());
        var paymentRequest = ArgumentCaptor.forClass(PaymentRequest.class);
        verify(paymentClient).requestOrderPayment(paymentRequest.capture());
        assertThat(paymentRequest.getValue().orderReference()).isEqualTo("ORD-FIXED");
        assertThat(paymentRequest.getValue().customer()).isEqualTo(CUSTOMER);

        var confirmation = ArgumentCaptor.forClass(OrderConfirmation.class);
        verify(orderProducer).sendOrderConfirmation(confirmation.capture());
        assertThat(confirmation.getValue().orderReference()).isEqualTo("ORD-FIXED");
        assertThat(confirmation.getValue().products()).isEqualTo(purchased);

        verify(productClient, never()).restoreStock(anyList());
    }

    @Test
    void createOrder_withoutReference_generatesOneStartingWithORD() {
        stubRepositorySaveAssignsId42();
        var request = requestWithReference(null);
        when(customerClient.findCustomerById("customer-1")).thenReturn(Optional.of(CUSTOMER));
        when(productClient.purchaseProducts(request.products())).thenReturn(List.of());

        service.createOrder(request);

        var savedOrder = ArgumentCaptor.forClass(Order.class);
        verify(repository).save(savedOrder.capture());
        assertThat(savedOrder.getValue().getReference()).startsWith("ORD-");
        assertThat(savedOrder.getValue().getReference()).hasSizeGreaterThan("ORD-".length());
    }

    @Test
    void createOrder_withBlankReference_generatesOneStartingWithORD() {
        stubRepositorySaveAssignsId42();
        var request = requestWithReference("   ");
        when(customerClient.findCustomerById("customer-1")).thenReturn(Optional.of(CUSTOMER));
        when(productClient.purchaseProducts(request.products())).thenReturn(List.of());

        service.createOrder(request);

        var savedOrder = ArgumentCaptor.forClass(Order.class);
        verify(repository).save(savedOrder.capture());
        assertThat(savedOrder.getValue().getReference()).startsWith("ORD-");
    }

    @Test
    void createOrder_whenCustomerDoesNotExist_throwsBusinessExceptionWithoutPurchasingProducts() {
        var request = requestWithReference("ORD-1");
        when(customerClient.findCustomerById("customer-1")).thenReturn(Optional.empty());

        // BusinessException ne transmet pas son message à RuntimeException (bug préexistant,
        // non modifié ici) : getMessage() est toujours null, le vrai texte est dans getMsg().
        var thrown = org.assertj.core.api.Assertions.catchThrowableOfType(
                () -> service.createOrder(request), BusinessException.class);
        assertThat(thrown).isNotNull();
        assertThat(thrown.getMsg()).contains("No customer exists");

        verify(productClient, never()).purchaseProducts(anyList());
        verify(repository, never()).save(any());
    }

    @Test
    void createOrder_whenPaymentFails_restoresStockAndRethrowsWithoutSendingKafkaConfirmation() {
        stubRepositorySaveAssignsId42();
        var request = requestWithReference("ORD-1");
        when(customerClient.findCustomerById("customer-1")).thenReturn(Optional.of(CUSTOMER));
        when(productClient.purchaseProducts(request.products())).thenReturn(List.of());
        var paymentFailure = new RuntimeException("payment declined");
        org.mockito.Mockito.doThrow(paymentFailure).when(paymentClient).requestOrderPayment(any());

        assertThatThrownBy(() -> service.createOrder(request))
                .isSameAs(paymentFailure);

        verify(productClient).restoreStock(request.products());
        verify(orderProducer, never()).sendOrderConfirmation(any());
    }

    @Test
    void findAllOrders_mapsEveryStoredOrder() {
        var order1 = Order.builder().id(1).reference("ORD-1").totalAmount(BigDecimal.TEN)
                .paymentMethod(PaymentMethod.PAYPAL).customerId("c1").build();
        var order2 = Order.builder().id(2).reference("ORD-2").totalAmount(BigDecimal.ONE)
                .paymentMethod(PaymentMethod.VISA).customerId("c2").build();
        when(repository.findAll()).thenReturn(List.of(order1, order2));

        var result = service.findAllOrders();

        assertThat(result).hasSize(2);
    }

    @Test
    void findById_withExistingId_returnsMappedResponse() {
        var order = Order.builder().id(1).reference("ORD-1").totalAmount(BigDecimal.TEN)
                .paymentMethod(PaymentMethod.PAYPAL).customerId("c1").build();
        when(repository.findById(1)).thenReturn(Optional.of(order));

        var response = service.findById(1);

        assertThat(response.reference()).isEqualTo("ORD-1");
    }

    @Test
    void findById_withUnknownId_throwsEntityNotFoundException() {
        when(repository.findById(999)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.findById(999))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("999");
    }
}
