package com.franck.ecommerce.order;

import com.franck.ecommerce.kafka.OrderConfirmation;
import com.franck.ecommerce.customer.CustomerClient;
import com.franck.ecommerce.exception.BusinessException;
import com.franck.ecommerce.kafka.OrderProducer;
import com.franck.ecommerce.orderline.OrderLineRequest;
import com.franck.ecommerce.orderline.OrderLineService;
import com.franck.ecommerce.payment.PaymentClient;
import com.franck.ecommerce.payment.PaymentRequest;
import com.franck.ecommerce.product.ProductClient;
import com.franck.ecommerce.product.PurchaseRequest;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository repository;
    private final OrderMapper mapper;
    private final CustomerClient customerClient;
    private final PaymentClient paymentClient;
    private final ProductClient productClient;
    private final OrderLineService orderLineService;
    private final OrderProducer orderProducer;

    @Transactional
    public Integer createOrder(OrderRequest request) {
        var customer = this.customerClient.findCustomerById(request.customerId())
                .orElseThrow(() -> new BusinessException("Cannot create order:: No customer exists with the provided ID"));

        var purchasedProducts = productClient.purchaseProducts(request.products());

        // À partir d'ici, le stock a déjà été décrémenté côté product-service (appel
        // synchrone ci-dessus, hors de la transaction JPA locale ci-dessous : un rollback
        // Spring ne l'annule pas). Toute erreur avant confirmation du paiement doit donc
        // compenser explicitement ce décrément pour ne pas "perdre" de stock disponible.
        Order order;
        try {
            order = this.repository.save(mapper.toOrder(request));

            for (PurchaseRequest purchaseRequest : request.products()) {
                orderLineService.saveOrderLine(
                        new OrderLineRequest(
                                null,
                                order.getId(),
                                purchaseRequest.productId(),
                                purchaseRequest.quantity()
                        )
                );
            }
            var paymentRequest = new PaymentRequest(
                    request.amount(),
                    request.paymentMethod(),
                    order.getId(),
                    order.getReference(),
                    customer
            );
            paymentClient.requestOrderPayment(paymentRequest);
        } catch (RuntimeException e) {
            productClient.restoreStock(request.products());
            throw e;
        }

        // Le paiement a réussi : la compensation ne s'applique plus au-delà de ce point,
        // même si la publication Kafka (fire-and-forget) échouait exceptionnellement.
        orderProducer.sendOrderConfirmation(
                new OrderConfirmation(
                        request.reference(),
                        request.amount(),
                        request.paymentMethod(),
                        customer,
                        purchasedProducts
                )
        );

        return order.getId();
    }

    public List<OrderResponse> findAllOrders() {
        return this.repository.findAll()
                .stream()
                .map(this.mapper::fromOrder)
                .collect(Collectors.toList());
    }

    public OrderResponse findById(Integer id) {
        return this.repository.findById(id)
                .map(this.mapper::fromOrder)
                .orElseThrow(() -> new EntityNotFoundException(String.format("No order found with the provided ID: %d", id)));
    }
}
