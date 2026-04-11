package com.ccts;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

/**
 * Main application class for Corruption Complaint & Tracking System
 */
@SpringBootApplication
@EnableCaching
public class CctsApplication {

    public static void main(String[] args) {
        SpringApplication.run(CctsApplication.class, args);
        System.out.println("CCTS Application started successfully at port 8081.");
        System.out.println("CCTS Application Started on port 8081");
    }
}


