package com.logisnine.monitorweb.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class DriverShipmentCandidateView {

    private Long shipmentId;

    private String vehicleNumber;

    private String cargoName;

    private String departureLocation;

    private String destinationLocation;

    private LocalDateTime plannedDepartureAt;
}