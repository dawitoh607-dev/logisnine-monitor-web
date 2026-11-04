package com.logisnine.monitorweb.service;

import com.logisnine.monitorweb.dto.DriverCheckInForm;
import com.logisnine.monitorweb.dto.DriverCheckInView;
import com.logisnine.monitorweb.mapper.ShipmentMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DriverCheckInService {

    private final ShipmentMapper shipmentMapper;


    public DriverCheckInView findShipment(String gatewayId) {

        if (gatewayId == null || gatewayId.isBlank()) {

            return null;
        }

        return shipmentMapper.findDriverCheckInByGatewayId(gatewayId.trim());
    }


    @Transactional
    public void confirmDriver(DriverCheckInForm form) {

        if (form.getDriverName() == null || form.getDriverName().isBlank()) {

            throw new IllegalArgumentException("기사 성함을 입력해 주세요.");
        }

        if (form.getDriverPhone() == null || form.getDriverPhone().isBlank()) {

            throw new IllegalArgumentException("연락처를 입력해 주세요.");
        }

        if (form.getVehicleNumber() == null || form.getVehicleNumber().isBlank()) {

            throw new IllegalArgumentException("차량번호를 입력해 주세요.");
        }

        int updated = shipmentMapper.updateDriverInfo(form);

        if (updated == 0) {

            throw new IllegalStateException("현재 배정된 운송정보를 확인할 수 없습니다.");
        }
    }
}