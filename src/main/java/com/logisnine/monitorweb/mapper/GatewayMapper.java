package com.logisnine.monitorweb.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface GatewayMapper {

    boolean existsUsableGateway(@Param("gatewayId") String gatewayId);

    boolean existsActiveAssignment(@Param("gatewayId") String gatewayId);
}