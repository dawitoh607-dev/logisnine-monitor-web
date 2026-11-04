package com.logisnine.monitorweb.mapper;

import com.logisnine.monitorweb.dto.GatewayView;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface GatewayMapper {

    List<GatewayView> findAvailableGateways();
}