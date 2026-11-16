package com.ncdex.order.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ncdex.order.entity.TradeOrder;
import org.slf4j.*;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
public class OrderEventProducer {
    private static final Logger log = LoggerFactory.getLogger(OrderEventProducer.class);
    private final KafkaTemplate<String, String> kafka;
    private final ObjectMapper mapper;

    public OrderEventProducer(KafkaTemplate<String, String> k, ObjectMapper m) {
        kafka = k;
        mapper = m;
    }

    public void publish(TradeOrder o) {
        try {
            String json = mapper.writeValueAsString(new Event("ORDER_CREATED", o.getOrderNumber(), o.getInstrumentId(), o.getQuantity(), o.getOrderType().name()));
            kafka.send("order-events", o.getInstrumentId(), json).whenComplete((r, e) -> {
                if (e != null) log.error("Failed to publish order event {}", o.getOrderNumber(), e);
            });
        } catch (Exception e) {
            log.error("Could not serialize order event {}", o.getOrderNumber(), e);
        }
    }

    public record Event(String eventType, String orderId, String instrumentId, int quantity, String orderType) {
    }
}