package com.stratton_oakmont.user_auth_service.repository;

import com.stratton_oakmont.user_auth_service.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // JpaRepository provides CRUD operations (save, findById, findAll, delete, etc.)

    // You can add custom query methods here if needed, for example:
    Optional<User> findByEmail(String email);
}