package com.logisnine.monitorweb.service;

import com.logisnine.monitorweb.dto.GatewayView;
import com.logisnine.monitorweb.mapper.GatewayMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GatewayService {

    private final GatewayMapper gatewayMapper;

    public List<GatewayView> findAvailableGateways() {
        return gatewayMapper.findAvailableGateways();
    }
}