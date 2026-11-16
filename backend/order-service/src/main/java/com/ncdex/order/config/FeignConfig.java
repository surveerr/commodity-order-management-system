package com.ncdex.order.config;

import feign.RequestInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Configuration
public class FeignConfig {
    @Bean
    RequestInterceptor authForwarder() {
        return template -> {
            var attrs = RequestContextHolder.getRequestAttributes();
            if (attrs instanceof ServletRequestAttributes s) {
                String auth = s.getRequest().getHeader("Authorization");
                if (auth != null) template.header("Authorization", auth);
            }
        };
    }
}