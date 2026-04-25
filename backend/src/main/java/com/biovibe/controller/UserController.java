package com.biovibe.controller;

import com.biovibe.common.Result;
import com.biovibe.model.dto.UserDTO;
import com.biovibe.model.entity.User;
import com.biovibe.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public Result<List<User>> getAllUsers() {
        return Result.success(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    public Result<User> getUserById(@PathVariable Long id) {
        return Result.success(userService.getUserById(id));
    }

    @PostMapping
    public Result<User> createUser(@Valid @RequestBody UserDTO userDTO) {
        return Result.success(userService.createUser(userDTO));
    }

    @PutMapping("/{id}")
    public Result<User> updateUser(@PathVariable Long id, @Valid @RequestBody UserDTO userDTO) {
        return Result.success(userService.updateUser(id, userDTO));
    }

    @DeleteMapping("/{id}")
    public Result<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return Result.success();
    }

}
