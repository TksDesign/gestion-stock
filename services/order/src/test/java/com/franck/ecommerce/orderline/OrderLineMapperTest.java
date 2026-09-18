package com.franck.ecommerce.orderline;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class OrderLineMapperTest {

    private final OrderLineMapper mapper = new OrderLineMapper();

    @Test
    void toOrderLine_mapsProductIdOrderIdAndQuantity() {
        var request = new OrderLineRequest(null, 7, 3, 2.5);

        var orderLine = mapper.toOrderLine(request);

        assertThat(orderLine.getProductId()).isEqualTo(3);
        assertThat(orderLine.getQuantity()).isEqualTo(2.5);
        assertThat(orderLine.getOrder().getId()).isEqualTo(7);
    }

    @Test
    void toOrderLineResponse_mapsIdAndQuantity() {
        var orderLine = OrderLine.builder().id(1).productId(3).quantity(2.5).build();

        var response = mapper.toOrderLineResponse(orderLine);

        assertThat(response.id()).isEqualTo(1);
        assertThat(response.quantity()).isEqualTo(2.5);
    }
}
