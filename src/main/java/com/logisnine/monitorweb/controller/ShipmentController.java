package com.logisnine.monitorweb.controller;

import com.logisnine.monitorweb.dto.ReadingChartView;
import com.logisnine.monitorweb.dto.ShipmentDetailView;
import com.logisnine.monitorweb.service.ShipmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Controller
@RequestMapping("/shipments")
@RequiredArgsConstructor
public class ShipmentController {

    private final ShipmentService shipmentService;

    @GetMapping("/{shipmentId}/readings")
    @ResponseBody
    public List<ReadingChartView> readings(
            @PathVariable Long shipmentId,
            @RequestParam String loggerId
    ) {

        return shipmentService.findReadingsForChart(
                shipmentId,
                loggerId
        );
    }

    @GetMapping("/{shipmentId}")
    public String detail(
            @PathVariable Long shipmentId,
            Model model
    ) {

        ShipmentDetailView shipment = shipmentService.findDetailById(shipmentId);

        // 화면 표시용 상태명
        shipment.setStatusName(
                switch (shipment.getStatus()) {
                    case "READY" -> "운송대기";
                    case "IN_PROGRESS" -> "운송중";
                    case "COMPLETED" -> "운송완료";
                    default -> shipment.getStatus();
                }
        );

        shipment.setElapsedTime(calculateElapsedTime(shipment.getStartedAt(), shipment.getEndedAt()));

        shipment.setDrivingStatus("주행중");

        model.addAttribute("shipment", shipment);

        return "shipment/detail";
    }

    private String calculateElapsedTime(LocalDateTime startedAt, LocalDateTime endedAt) {

        if (startedAt == null) {
            return "-";
        }

        LocalDateTime targetTime = endedAt != null ? endedAt : LocalDateTime.now();

        Duration duration = Duration.between(startedAt, targetTime);

        long hours = duration.toHours();
        long minutes = duration.toMinutesPart();

        return hours + "시간 " + minutes + "분";
    }
}