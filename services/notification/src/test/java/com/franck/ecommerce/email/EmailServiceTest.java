package com.franck.ecommerce.email;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.franck.ecommerce.kafka.order.Product;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import java.math.BigDecimal;
import java.util.List;
import java.util.Properties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;
import org.thymeleaf.spring6.SpringTemplateEngine;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;
    @Mock
    private SpringTemplateEngine templateEngine;

    private EmailService emailService;

    @BeforeEach
    void setUp() {
        emailService = new EmailService(mailSender, templateEngine);
    }

    private static MimeMessage newMimeMessage() {
        return new MimeMessage(Session.getInstance(new Properties()));
    }

    @Test
    void sendPaymentSuccessEmail_rendersTemplateAndSendsMail() throws Exception {
        when(mailSender.createMimeMessage()).thenReturn(newMimeMessage());
        when(templateEngine.process(org.mockito.ArgumentMatchers.eq("payment-confirmation.html"), any()))
                .thenReturn("<html>paid</html>");

        emailService.sendPaymentSuccessEmail("paul@kshop.com", "Paul Client", BigDecimal.valueOf(49.99), "ORD-1");

        verify(mailSender).send(any(MimeMessage.class));
    }

    @Test
    void sendPaymentSuccessEmail_whenMailServerRejects_doesNotPropagateException() throws Exception {
        when(mailSender.createMimeMessage()).thenReturn(newMimeMessage());
        when(templateEngine.process(anyString(), any())).thenReturn("<html>paid</html>");
        org.mockito.Mockito.doThrow(new MailSendException("SMTP down")).when(mailSender).send(any(MimeMessage.class));

        // Ne doit pas relancer l'exception (catch explicite dans EmailService pour ne pas
        // faire boucler le listener Kafka appelant) — l'absence d'exception EST l'assertion.
        emailService.sendPaymentSuccessEmail("paul@kshop.com", "Paul Client", BigDecimal.valueOf(49.99), "ORD-1");
    }

    @Test
    void sendOrderConfirmationEmail_rendersTemplateAndSendsMail() throws Exception {
        when(mailSender.createMimeMessage()).thenReturn(newMimeMessage());
        when(templateEngine.process(org.mockito.ArgumentMatchers.eq("order-confirmation.html"), any()))
                .thenReturn("<html>ordered</html>");
        var products = List.of(new Product(1, "Keyboard", "desc", BigDecimal.valueOf(29.99), 2.0));

        emailService.sendOrderConfirmationEmail("paul@kshop.com", "Paul Client", BigDecimal.valueOf(59.98), "ORD-1", products);

        verify(mailSender).send(any(MimeMessage.class));
    }

    @Test
    void sendOrderConfirmationEmail_whenMailServerRejects_doesNotPropagateException() throws Exception {
        when(mailSender.createMimeMessage()).thenReturn(newMimeMessage());
        when(templateEngine.process(anyString(), any())).thenReturn("<html>ordered</html>");
        org.mockito.Mockito.doThrow(new MailSendException("SMTP down")).when(mailSender).send(any(MimeMessage.class));

        emailService.sendOrderConfirmationEmail("paul@kshop.com", "Paul Client", BigDecimal.valueOf(59.98), "ORD-1", List.of());
    }
}
