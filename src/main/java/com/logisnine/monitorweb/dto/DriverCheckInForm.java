package com.logisnine.monitorweb.dto;

import lombok.Data;

@Data
public class DriverCheckInForm {

    private Long shipmentId;

    private String gatewayId;

    private String driverName;

    private String driverPhone;

    private String vehicleNumber;
}