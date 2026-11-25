package com.logisnine.monitorweb.service;

import com.logisnine.monitorweb.dto.DriverCheckInConfirmForm;
import com.logisnine.monitorweb.dto.DriverCheckInForm;
import com.logisnine.monitorweb.dto.DriverShipmentCandidateView;
import com.logisnine.monitorweb.mapper.GatewayMapper;
import com.logisnine.monitorweb.mapper.ShipmentMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DriverCheckInService {

    private final ShipmentMapper shipmentMapper;
    private final GatewayMapper gatewayMapper;


    public List<DriverShipmentCandidateView> findCandidates(DriverCheckInForm form) {

        String gatewayId = normalizeGatewayId(form.getGatewayId());

        String vehicleNumber = normalizeVehicleNumber(form.getVehicleNumber());


        validateGateway(gatewayId);


        if (vehicleNumber == null || vehicleNumber.isBlank()) {

            throw new IllegalArgumentException("차량번호를 입력해 주세요.");
        }


        return shipmentMapper.findDriverShipmentCandidates(vehicleNumber);
    }


    @Transactional
    public Long confirm(DriverCheckInConfirmForm form) {

        String gatewayId = normalizeGatewayId(form.getGatewayId());

        String vehicleNumber = normalizeVehicleNumber(form.getVehicleNumber());


        /*
         * Gateway 다시 검증
         *
         * 검색 후 확인창을 띄운 사이에도
         * 다른 곳에서 Gateway가 사용될 수 있으므로
         * 반드시 최종 순간에 다시 확인.
         */
        validateGateway(gatewayId);


        /*
         * shipment 최종 연결
         *
         * shipmentId뿐만 아니라
         * vehicleNumber / READY / gateway_id IS NULL까지
         * SQL에서 다시 검증한다.
         */
        int updated = shipmentMapper.bindGatewayToShipment(form.getShipmentId(), gatewayId, vehicleNumber, form.getDriverName(), form.getDriverPhone());


        if (updated == 0) {

            throw new IllegalStateException("선택한 운송이 이미 연결되었거나 " + "더 이상 연결할 수 없는 상태입니다.");
        }


        /*
         * 실제 할당 이력 생성
         */
        shipmentMapper.insertDeviceAssignment(form.getShipmentId(), gatewayId);


        return form.getShipmentId();
    }


    private void validateGateway(String gatewayId) {

        if (gatewayId == null || gatewayId.isBlank()) {

            throw new IllegalArgumentException("Gateway 정보가 없습니다.");
        }


        if (!gatewayMapper.existsUsableGateway(gatewayId)) {

            throw new IllegalStateException("등록되지 않았거나 사용할 수 없는 Gateway입니다.");
        }


        if (gatewayMapper.existsActiveAssignment(gatewayId)) {

            throw new IllegalStateException("이미 다른 운송에 연결된 Gateway입니다.");
        }
    }


    private String normalizeVehicleNumber(String vehicleNumber) {

        if (vehicleNumber == null) {
            return null;
        }

        return vehicleNumber.replaceAll("\\s+", "").trim().toUpperCase();
    }


    private String normalizeGatewayId(String gatewayId) {

        if (gatewayId == null) {
            return null;
        }

        return gatewayId.trim();
    }
}