package com.franck.ecommerce.payment;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.franck.ecommerce.notification.NotificationProducer;
import com.franck.ecommerce.notification.PaymentNotificationRequest;
import java.math.BigDecimal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private PaymentRepository repository;
    @Mock
    private NotificationProducer notificationProducer;

    private final PaymentMapper mapper = new PaymentMapper();

    private PaymentService service;

    @BeforeEach
    void setUp() {
        service = new PaymentService(repository, mapper, notificationProducer);
    }

    @Test
    void createPayment_savesPaymentAndSendsNotificationWithCustomerDetails() {
        var customer = new Customer("c1", "Paul", "Client", "paul@kshop.com");
        var request = new PaymentRequest(null, BigDecimal.valueOf(49.99), PaymentMethod.CREDIT_CARD, 7, "ORD-1", customer);
        when(repository.save(any(Payment.class))).thenAnswer(invocation -> {
            Payment p = invocation.getArgument(0);
            p.setId(42);
            return p;
        });

        var paymentId = service.createPayment(request);

        assertThat(paymentId).isEqualTo(42);

        var notification = ArgumentCaptor.forClass(PaymentNotificationRequest.class);
        verify(notificationProducer).sendNotification(notification.capture());
        assertThat(notification.getValue().orderReference()).isEqualTo("ORD-1");
        assertThat(notification.getValue().amount()).isEqualByComparingTo("49.99");
        assertThat(notification.getValue().paymentMethod()).isEqualTo(PaymentMethod.CREDIT_CARD);
        assertThat(notification.getValue().customerFirstname()).isEqualTo("Paul");
        assertThat(notification.getValue().customerLastname()).isEqualTo("Client");
        assertThat(notification.getValue().customerEmail()).isEqualTo("paul@kshop.com");
    }
}
