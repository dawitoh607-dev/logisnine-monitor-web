package com.logisnine.monitorweb.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class DashboardEventView {

    private Long alertId;
    private Long shipmentId;

    private String gatewayId;
    private String vehicleNumber;
    private String cargoName;

    private String alertType;
    private String status;

    private LocalDateTime detectedAt;

    private Double extremeValue;
    private Double thresholdValue;
}
