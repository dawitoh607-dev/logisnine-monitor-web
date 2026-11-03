package com.logisnine.monitorweb.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class RoutePointView {

    private LocalDateTime measuredAt;

    private Double latitude;
    private Double longitude;
}