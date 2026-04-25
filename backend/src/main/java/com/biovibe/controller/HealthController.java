package com.biovibe.controller;

import com.biovibe.common.Result;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    @GetMapping("/health")
    public Result<Map<String, String>> health() {
        Map<String, String> data = new HashMap<>();
        data.put("status", "running");
        data.put("message", "BIOVIBE Backend is running");
        return Result.success(data);
    }

}
