package com.biovibe.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AnalysisTaskDTO {

    @NotBlank(message = "任务名称不能为空")
    private String taskName;

    @NotBlank(message = "分析类型不能为空")
    private String analysisType;

    private String description;

    private String inputFilePath;

}
