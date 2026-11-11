package com.logisnine.monitorweb.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http.authorizeHttpRequests(auth -> auth

                        // 로그인 화면
                        .requestMatchers("/login", "/css/**", "/js/**", "/images/**", "/favicon.ico", "/error").permitAll()

                        // 기사 QR 체크인 화면
                        .requestMatchers("/driver/check-in", "/driver/check-in/**").permitAll()

                        // 나머지는 로그인 필수
                        .anyRequest().authenticated())

                .formLogin(form -> form.loginPage("/login").defaultSuccessUrl("/shipments", true).permitAll())

                .logout(logout -> logout.logoutUrl("/logout").logoutSuccessUrl("/login?logout").permitAll());

        return http.build();
    }


    @Bean
    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }


    @Bean
    public UserDetailsService userDetailsService(@Value("${app.security.admin.username}") String username,
                                                 @Value("${app.security.admin.password}") String password,
                                                 PasswordEncoder passwordEncoder) {

        UserDetails admin = User.builder().username(username).password(passwordEncoder.encode(password)).roles("ADMIN").build();

        return new InMemoryUserDetailsManager(admin);
    }
}