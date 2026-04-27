package com.biovibe.controller;

import com.biovibe.common.Result;
import com.biovibe.model.dto.PCARequestDTO;
import com.biovibe.model.dto.PCAResponseDTO;
import com.biovibe.service.PCAAnalysisService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pca")
public class PCAController {

    private final PCAAnalysisService pcaService;

    public PCAController(PCAAnalysisService pcaService) {
        this.pcaService = pcaService;
    }

    private Long getUserId(HttpServletRequest request) {
        return (Long) request.getAttribute("userId");
    }

    @PostMapping("/run")
    public Result<PCAResponseDTO> runPCA(@RequestBody PCARequestDTO request,
                                         HttpServletRequest httpRequest) {
        Long userId = getUserId(httpRequest);
        PCAResponseDTO response = pcaService.runPCA(userId, request);
        if ("error".equals(response.getStatus())) {
            return Result.error(500, response.getMessage());
        }
        return Result.success("PCA分析完成", response);
    }

    @PostMapping("/detect")
    public Result<PCAResponseDTO> detectFormat(@RequestBody PCARequestDTO request,
                                               HttpServletRequest httpRequest) {
        Long userId = getUserId(httpRequest);
        PCAResponseDTO response = pcaService.detectDataFormat(userId, request.getFileName());
        if ("error".equals(response.getStatus())) {
            return Result.error(500, response.getMessage());
        }
        return Result.success("格式检测完成", response);
    }
}
