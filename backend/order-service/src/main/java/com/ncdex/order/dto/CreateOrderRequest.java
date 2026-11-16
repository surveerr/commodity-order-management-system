package com.ncdex.order.dto;

import com.ncdex.order.entity.OrderType;
import jakarta.validation.constraints.*;

public record CreateOrderRequest(@NotBlank String instrumentId, @NotNull OrderType orderType, @Positive int quantity,
                                 @Positive double price, String remarks) {
}