package com.logisnine.monitorweb.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MapAlertView {

    private Long alertId;

    private String alertType;

    private String loggerId;

    private LocalDateTime detectedAt;

    private Double extremeValue;

    private Double thresholdValue;

    private Double latitude;

    private Double longitude;
}
