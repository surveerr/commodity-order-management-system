package com.ncdex.order.repository;

import com.ncdex.order.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.*;

public interface OrderRepository extends JpaRepository<TradeOrder, Long>, JpaSpecificationExecutor<TradeOrder> {
    List<TradeOrder> findTop10ByOrderByCreatedAtDesc();

    long countByStatus(OrderStatus status);

    List<TradeOrder> findByCreatedBy(String username);
}