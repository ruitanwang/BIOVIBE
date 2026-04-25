package com.biovibe.service;

import com.biovibe.model.dto.UserDTO;
import com.biovibe.model.entity.User;
import com.biovibe.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
    }

    public User createUser(UserDTO userDTO) {
        if (userRepository.existsByUsername(userDTO.getUsername())) {
            throw new RuntimeException("用户名已存在");
        }

        User user = new User();
        user.setUsername(userDTO.getUsername());
        user.setPassword(userDTO.getPassword());
        user.setEmail(userDTO.getEmail());
        user.setNickname(userDTO.getNickname());

        return userRepository.save(user);
    }

    public User updateUser(Long id, UserDTO userDTO) {
        User user = getUserById(id);
        user.setUsername(userDTO.getUsername());
        user.setEmail(userDTO.getEmail());
        user.setNickname(userDTO.getNickname());
        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

}
