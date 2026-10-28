package com.logisnine.monitorweb.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ReadingChartView {

    private LocalDateTime measuredAt;

    private Double temperature;
    private Double humidity;
}