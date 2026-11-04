package com.logisnine.monitorweb.controller;

import com.logisnine.monitorweb.dto.DriverCheckInForm;
import com.logisnine.monitorweb.dto.DriverCheckInView;
import com.logisnine.monitorweb.service.DriverCheckInService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequiredArgsConstructor
public class DriverCheckInController {

    private final DriverCheckInService driverCheckInService;


    @GetMapping("/driver/check-in")
    public String checkInForm(@RequestParam String gatewayId, Model model) {

        DriverCheckInView shipment = driverCheckInService.findShipment(gatewayId);


        model.addAttribute("shipment", shipment);


        if (shipment != null) {

            DriverCheckInForm form = new DriverCheckInForm();

            form.setShipmentId(shipment.getShipmentId());

            form.setGatewayId(shipment.getGatewayId());

            /*
             * 최초 배차 때 받은 기사 연락처가 있다면
             * 미리 입력해 둔다.
             */
            form.setDriverPhone(shipment.getDriverPhone());


            model.addAttribute("driverForm", form);
        }


        return "driver-check-in";
    }


    @PostMapping("/driver/check-in")
    public String checkIn(@ModelAttribute("driverForm") DriverCheckInForm form) {

        driverCheckInService.confirmDriver(form);


        return "redirect:/driver/check-in/complete";
    }


    @GetMapping("/driver/check-in/complete")
    public String complete() {

        return "driver-check-in-complete";
    }
}