package com.ncdex.order.service;

import com.ncdex.order.client.InstrumentClient;
import com.ncdex.order.dto.CreateOrderRequest;
import com.ncdex.order.entity.OrderStatus;
import com.ncdex.order.entity.TradeOrder;
import com.ncdex.order.kafka.OrderEventProducer;
import com.ncdex.order.repository.OrderRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class OrderManagementService {
    private final OrderRepository repo;
    private final InstrumentClient instruments;
    private final OrderEventProducer events;

    public OrderManagementService(OrderRepository r, InstrumentClient i, OrderEventProducer e) {
        repo = r;
        instruments = i;
        events = e;
    }

    @Transactional
    public TradeOrder create(CreateOrderRequest req, String user) {
        if (req.quantity() <= 0 || req.price() <= 0)
            throw new IllegalArgumentException("Quantity and price must be positive");
        Map<String, Object> inst;
        try {
            inst = instruments.get(req.instrumentId());
        } catch (feign.FeignException.NotFound e) {
            throw new NoSuchElementException("Instrument not found");
        } catch (feign.FeignException e) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE, "Instrument Service unavailable", e);
        }
        if (!Boolean.TRUE.equals(inst.get("active"))) throw new IllegalArgumentException("Instrument is inactive");
        TradeOrder o = new TradeOrder();
        o.setOrderNumber("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        o.setInstrumentId(req.instrumentId());
        o.setOrderType(req.orderType());
        o.setQuantity(req.quantity());
        o.setPrice(req.price());
        o.setRemarks(req.remarks());
        o.setCreatedBy(user);
        TradeOrder saved = repo.save(o);
        events.publish(saved);
        return saved;
    }

    public Page<TradeOrder> list(String user, boolean admin, String instrument, String orderNumber, OrderStatus status, Pageable pageable) {
        return repo.findAll((root, q, cb) -> {
            List<jakarta.persistence.criteria.Predicate> p = new ArrayList<>();
            if (!admin) p.add(cb.equal(root.get("createdBy"), user));
            if (instrument != null && !instrument.isBlank()) p.add(cb.equal(root.get("instrumentId"), instrument));
            if (orderNumber != null && !orderNumber.isBlank())
                p.add(cb.like(cb.lower(root.get("orderNumber")), "%" + orderNumber.toLowerCase() + "%"));
            if (status != null) p.add(cb.equal(root.get("status"), status));
            return cb.and(p.toArray(jakarta.persistence.criteria.Predicate[]::new));
        }, pageable);
    }

    public TradeOrder get(long id, String user, boolean admin) {
        TradeOrder o = repo.findById(id).orElseThrow(() -> new NoSuchElementException("Order not found"));
        if (!admin && !o.getCreatedBy().equals(user)) throw new SecurityException("You can only view your own orders");
        return o;
    }

    @Transactional
    public TradeOrder transition(long id, String action, String user, boolean admin) {
        TradeOrder o = get(id, user, admin);
        if (action.equals("cancel")) {
            if (o.getStatus() != OrderStatus.SUBMITTED)
                throw new IllegalStateException("Only submitted orders can be cancelled");
            o.setStatus(OrderStatus.CANCELLED);
        } else {
            if (!admin) throw new SecurityException("Administrator role required");
            if (o.getStatus() != OrderStatus.SUBMITTED)
                throw new IllegalStateException("Only submitted orders can be processed");
            if (action.equals("approve")) o.setStatus(OrderStatus.APPROVED);
            else if (action.equals("reject")) o.setStatus(OrderStatus.REJECTED);
            else throw new IllegalArgumentException("Unknown action");
        }
        return repo.save(o);
    }

    public Map<String, Object> dashboard() {
        return Map.of("total", repo.count(), "pending", repo.countByStatus(OrderStatus.SUBMITTED), "approved", repo.countByStatus(OrderStatus.APPROVED), "rejected", repo.countByStatus(OrderStatus.REJECTED), "recent", repo.findTop10ByOrderByCreatedAtDesc());
    }
}
