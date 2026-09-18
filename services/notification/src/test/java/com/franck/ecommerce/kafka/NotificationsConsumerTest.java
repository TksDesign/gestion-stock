package com.franck.ecommerce.kafka;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;

import com.franck.ecommerce.email.EmailService;
import com.franck.ecommerce.kafka.order.Customer;
import com.franck.ecommerce.kafka.order.OrderConfirmation;
import com.franck.ecommerce.kafka.payment.PaymentConfirmation;
import com.franck.ecommerce.kafka.payment.PaymentMethod;
import com.franck.ecommerce.notification.Notification;
import com.franck.ecommerce.notification.NotificationRepository;
import com.franck.ecommerce.notification.NotificationType;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class NotificationsConsumerTest {

    @Mock
    private NotificationRepository repository;
    @Mock
    private EmailService emailService;

    private NotificationsConsumer consumer;

    @BeforeEach
    void setUp() {
        consumer = new NotificationsConsumer(repository, emailService);
    }

    @Test
    void consumePaymentSuccessNotifications_savesNotificationAndSendsPaymentEmail() throws Exception {
        var confirmation = new PaymentConfirmation("ORD-1", BigDecimal.valueOf(49.99), PaymentMethod.CREDIT_CARD,
                "Paul", "Client", "paul@kshop.com");

        consumer.consumePaymentSuccessNotifications(confirmation);

        var saved = ArgumentCaptor.forClass(Notification.class);
        verify(repository).save(saved.capture());
        assertThat(saved.getValue().getType()).isEqualTo(NotificationType.PAYMENT_CONFIRMATION);
        assertThat(saved.getValue().getPaymentConfirmation()).isEqualTo(confirmation);

        verify(emailService).sendPaymentSuccessEmail("paul@kshop.com", "Paul Client",
                BigDecimal.valueOf(49.99), "ORD-1");
    }

    @Test
    void consumeOrderConfirmationNotifications_savesNotificationAndSendsOrderEmail() throws Exception {
        var customer = new Customer("c1", "Paul", "Client", "paul@kshop.com");
        var confirmation = new OrderConfirmation("ORD-1", BigDecimal.valueOf(59.98),
                com.franck.ecommerce.kafka.payment.PaymentMethod.CREDIT_CARD, customer, List.of());

        consumer.consumeOrderConfirmationNotifications(confirmation);

        var saved = ArgumentCaptor.forClass(Notification.class);
        verify(repository).save(saved.capture());
        assertThat(saved.getValue().getType()).isEqualTo(NotificationType.ORDER_CONFIRMATION);
        assertThat(saved.getValue().getOrderConfirmation()).isEqualTo(confirmation);

        verify(emailService).sendOrderConfirmationEmail("paul@kshop.com", "Paul Client",
                BigDecimal.valueOf(59.98), "ORD-1", List.of());
    }
}
