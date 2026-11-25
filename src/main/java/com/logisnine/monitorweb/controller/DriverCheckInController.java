package com.logisnine.monitorweb.controller;

import com.logisnine.monitorweb.dto.DriverCheckInConfirmForm;
import com.logisnine.monitorweb.dto.DriverCheckInForm;
import com.logisnine.monitorweb.dto.DriverShipmentCandidateView;
import com.logisnine.monitorweb.service.DriverCheckInService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Controller
@RequiredArgsConstructor
public class DriverCheckInController {

    private final DriverCheckInService driverCheckInService;


    @GetMapping("/driver/check-in")
    public String checkInForm(@RequestParam String gatewayId, Model model) {

        DriverCheckInForm form = new DriverCheckInForm();

        form.setGatewayId(gatewayId.trim());

        model.addAttribute("driverForm", form);

        return "driver-check-in";
    }

    @PostMapping("/driver/check-in/search")
    public String searchShipments(@ModelAttribute("driverForm") DriverCheckInForm form, Model model) {

        try {

            List<DriverShipmentCandidateView> candidates = driverCheckInService.findCandidates(form);

            model.addAttribute("candidates", candidates);


            if (candidates.isEmpty()) {

                model.addAttribute("searchError", "해당 차량번호로 연결 가능한 운송건이 없습니다.");
            }

        } catch (Exception e) {

            model.addAttribute("searchError", e.getMessage());
        }


        return "driver-check-in";
    }

    @PostMapping("/driver/check-in/confirm")
    public String confirm(@ModelAttribute DriverCheckInConfirmForm form, RedirectAttributes redirectAttributes) {

        try {

            Long shipmentId = driverCheckInService.confirm(form);

            redirectAttributes.addFlashAttribute("message", "Gateway 연결이 완료되었습니다.");

            return "redirect:/driver/check-in/complete";

        } catch (Exception e) {

            redirectAttributes.addFlashAttribute("error", e.getMessage());

            return "redirect:/driver/check-in" + "?gatewayId=" + URLEncoder.encode(form.getGatewayId(), StandardCharsets.UTF_8);
        }
    }

    @GetMapping("/driver/check-in/complete")
    public String complete() {

        return "driver-check-in-complete";
    }
}