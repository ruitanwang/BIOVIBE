package com.biovibe.controller;

import com.biovibe.common.Result;
import com.biovibe.model.dto.AuthResponse;
import com.biovibe.model.dto.LoginRequest;
import com.biovibe.model.dto.RegisterRequest;
import com.biovibe.model.entity.User;
import com.biovibe.repository.UserRepository;
import com.biovibe.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public Result<AuthResponse> register(@RequestBody RegisterRequest request) {
        if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
            return Result.error(400, "用户名不能为空");
        }
        if (request.getPassword() == null || request.getPassword().length() < 6) {
            return Result.error(400, "密码长度不能少于6位");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            return Result.error(400, "用户名已存在");
        }

        User user = new User();
        user.setUsername(request.getUsername().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getId(), user.getUsername());
        AuthResponse response = new AuthResponse(token, user.getId(), user.getUsername());
        return Result.success("注册成功", response);
    }

    @PostMapping("/login")
    public Result<AuthResponse> login(@RequestBody LoginRequest request) {
        if (request.getUsername() == null || request.getPassword() == null) {
            return Result.error(400, "用户名和密码不能为空");
        }

        User user = userRepository.findByUsername(request.getUsername())
                .orElse(null);

        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return Result.error(401, "用户名或密码错误");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getUsername());
        AuthResponse response = new AuthResponse(token, user.getId(), user.getUsername());
        return Result.success("登录成功", response);
    }
}
