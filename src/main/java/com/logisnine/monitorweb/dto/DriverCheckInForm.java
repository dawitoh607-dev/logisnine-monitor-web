package com.logisnine.monitorweb.dto;

import lombok.Data;

@Data
public class DriverCheckInForm {

    private String gatewayId;

    private String vehicleNumber;

    private String driverName;

    private String driverPhone;
}