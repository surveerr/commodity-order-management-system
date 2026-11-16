package com.ncdex.order.entity;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "orders", indexes = {@Index(name = "idx_order_status", columnList = "status"), @Index(name = "idx_order_instrument", columnList = "instrument_id")})
public class TradeOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true)
    private String orderNumber;
    @Column(name = "instrument_id", nullable = false)
    private String instrumentId;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderType orderType;
    @Column(nullable = false)
    private int quantity;
    @Column(nullable = false)
    private double price;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status = OrderStatus.SUBMITTED;
    private String remarks;
    @Column(nullable = false)
    private String createdBy;
    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();

    public Long getId() {
        return id;
    }

    public String getOrderNumber() {
        return orderNumber;
    }

    public void setOrderNumber(String v) {
        orderNumber = v;
    }

    public String getInstrumentId() {
        return instrumentId;
    }

    public void setInstrumentId(String v) {
        instrumentId = v;
    }

    public OrderType getOrderType() {
        return orderType;
    }

    public void setOrderType(OrderType v) {
        orderType = v;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int v) {
        quantity = v;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double v) {
        price = v;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus v) {
        status = v;
        updatedAt = Instant.now();
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String v) {
        remarks = v;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String v) {
        createdBy = v;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
