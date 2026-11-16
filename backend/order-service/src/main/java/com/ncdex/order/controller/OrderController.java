package com.ncdex.order.controller;

import com.ncdex.order.dto.CreateOrderRequest;
import com.ncdex.order.entity.*;
import com.ncdex.order.service.OrderManagementService;
import jakarta.validation.Valid;
import org.springframework.data.domain.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;

import java.util.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderManagementService service;

    public OrderController(OrderManagementService s) {
        service = s;
    }

    @PostMapping
    @org.springframework.web.bind.annotation.ResponseStatus(HttpStatus.CREATED)
    public TradeOrder create(@Valid @RequestBody CreateOrderRequest r, Authentication a) {
        return service.create(r, a.getName());
    }

    @GetMapping
    public Page<TradeOrder> list(Authentication a, @RequestParam(required = false) String instrumentId, @RequestParam(required = false) String orderNumber, @RequestParam(required = false) OrderStatus status, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size, @RequestParam(defaultValue = "createdAt") String sort, @RequestParam(defaultValue = "desc") String direction) {
        boolean admin = a.getAuthorities().stream().anyMatch(x -> x.getAuthority().equals("ROLE_ADMIN"));
        Sort s = direction.equalsIgnoreCase("asc") ? Sort.by(sort).ascending() : Sort.by(sort).descending();
        return service.list(a.getName(), admin, instrumentId, orderNumber, status, PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100), s));
    }

    @GetMapping("/{id}")
    public TradeOrder get(@PathVariable long id, Authentication a) {
        return service.get(id, a.getName(), isAdmin(a));
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public TradeOrder approve(@PathVariable long id, Authentication a) {
        return service.transition(id, "approve", a.getName(), true);
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public TradeOrder reject(@PathVariable long id, Authentication a) {
        return service.transition(id, "reject", a.getName(), true);
    }

    @PatchMapping("/{id}/cancel")
    public TradeOrder cancel(@PathVariable long id, Authentication a) {
        return service.transition(id, "cancel", a.getName(), isAdmin(a));
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> dashboard() {
        return service.dashboard();
    }

    private boolean isAdmin(Authentication a) {
        return a.getAuthorities().stream().anyMatch(x -> x.getAuthority().equals("ROLE_ADMIN"));
    }
}