package com.rockstar.ri.controller;

import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    /** Basic-authenticated handshake used by the frontend login screen. */
    @GetMapping("/login")
    public Map<String, String> login(Authentication authentication) {
        return Map.of(
                "username", authentication.getName(),
                "role", "SUPERUSER"
        );
    }
}
