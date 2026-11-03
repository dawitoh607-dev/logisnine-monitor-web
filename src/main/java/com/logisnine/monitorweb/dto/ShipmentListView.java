package com.logisnine.monitorweb.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ShipmentListView {

    private Long shipmentId;

    private String gatewayId;

    private String cargoName;

    private String departureLocation;

    private String destinationLocation;

    private String vehicleNumber;

    private String status;

    private String statusName;

    private LocalDateTime startedAt;

    private LocalDateTime endedAt;

    private LocalDateTime createdAt;

    private Integer tempDeviationCount;

    private Integer shockCount;
}