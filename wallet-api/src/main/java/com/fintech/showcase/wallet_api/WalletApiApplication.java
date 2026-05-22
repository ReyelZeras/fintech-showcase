package com.fintech.showcase.wallet_api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching // Habilita o suporte a Cache do Spring
public class WalletApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(WalletApiApplication.class, args);
	}

}
