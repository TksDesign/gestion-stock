package com.franck.ecommerce.kafka;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;

import com.franck.ecommerce.order.PaymentMethod;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.messaging.Message;

@ExtendWith(MockitoExtension.class)
class OrderProducerTest {

    @Mock
    private KafkaTemplate<String, OrderConfirmation> kafkaTemplate;

    @Test
    void sendOrderConfirmation_sendsMessageToOrderTopicWithThePayload() {
        var producer = new OrderProducer(kafkaTemplate);
        var confirmation = new OrderConfirmation("ORD-1", BigDecimal.TEN, PaymentMethod.CREDIT_CARD, null, List.of());

        producer.sendOrderConfirmation(confirmation);

        @SuppressWarnings("unchecked")
        ArgumentCaptor<Message<OrderConfirmation>> captor = ArgumentCaptor.forClass(Message.class);
        verify(kafkaTemplate).send(captor.capture());
        assertThat(captor.getValue().getPayload()).isEqualTo(confirmation);
        assertThat(captor.getValue().getHeaders().get(org.springframework.kafka.support.KafkaHeaders.TOPIC))
                .isEqualTo("order-topic");
    }
}
