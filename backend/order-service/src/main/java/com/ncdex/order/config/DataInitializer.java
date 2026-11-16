package com.ncdex.order.config;

import com.ncdex.order.entity.AppUser;
import com.ncdex.order.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {
    @Bean
    CommandLineRunner seedUsers(UserRepository repo, PasswordEncoder encoder) {
        return args -> {
            if (repo.findByUsername("admin").isEmpty())
                repo.save(new AppUser("admin", encoder.encode("Admin@123"), "ADMIN"));
            if (repo.findByUsername("operator").isEmpty())
                repo.save(new AppUser("operator", encoder.encode("Operator@123"), "OPERATIONS"));
        };
    }
}