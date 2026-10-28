package com.logisnine.monitorweb.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class LatestReadingView {

    private String loggerId;

    private Double temperature;
    private Double humidity;
    private Integer batteryPct;

    private LocalDateTime measuredAt;

}
