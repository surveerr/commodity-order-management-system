package com.ncdex.order.controller;

import com.ncdex.order.repository.UserRepository;
import com.ncdex.order.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;

import java.util.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AuthController(UserRepository u, PasswordEncoder e, JwtService j) {
        users = u;
        encoder = e;
        jwt = j;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Login req) {
        var u = users.findByUsername(req.username()).orElse(null);
        if (u == null || !u.isEnabled() || !encoder.matches(req.password(), u.getPassword()))
            return ResponseEntity.status(401).body(Map.of("error", "Invalid username or password"));
        return ResponseEntity.ok(Map.of("token", jwt.generate(u.getUsername(), u.getRole()), "username", u.getUsername(), "role", u.getRole()));
    }

    public record Login(String username, String password) {
    }
}