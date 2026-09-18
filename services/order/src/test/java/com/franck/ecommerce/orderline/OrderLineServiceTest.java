package com.franck.ecommerce.orderline;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class OrderLineServiceTest {

    @Mock
    private OrderLineRepository repository;

    private final OrderLineMapper mapper = new OrderLineMapper();

    private OrderLineService service;

    @BeforeEach
    void setUp() {
        service = new OrderLineService(repository, mapper);
    }

    @Test
    void saveOrderLine_savesAndReturnsGeneratedId() {
        var request = new OrderLineRequest(null, 7, 3, 2.0);
        when(repository.save(any(OrderLine.class))).thenAnswer(invocation -> {
            OrderLine line = invocation.getArgument(0);
            line.setId(99);
            return line;
        });

        var id = service.saveOrderLine(request);

        assertThat(id).isEqualTo(99);
    }

    @Test
    void findAllByOrderId_mapsEveryLineForThatOrder() {
        var line1 = OrderLine.builder().id(1).productId(3).quantity(2.0).build();
        var line2 = OrderLine.builder().id(2).productId(4).quantity(1.0).build();
        when(repository.findAllByOrderId(7)).thenReturn(List.of(line1, line2));

        var result = service.findAllByOrderId(7);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).id()).isEqualTo(1);
        assertThat(result.get(1).quantity()).isEqualTo(1.0);
    }
}
