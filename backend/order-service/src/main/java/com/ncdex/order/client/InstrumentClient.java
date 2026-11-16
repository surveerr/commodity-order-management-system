package com.ncdex.order.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@FeignClient(name = "instrument-service", path = "/api/instruments")
public interface InstrumentClient {
    @GetMapping("/{id}")
    Map<String, Object> get(@PathVariable("id") String id);
}