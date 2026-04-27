package com.biovibe.model.dto;

public class PCARequestDTO {
    private String fileName;
    private String normalization;
    private String scale;
    private Integer maxComponents;

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getNormalization() {
        return normalization;
    }

    public void setNormalization(String normalization) {
        this.normalization = normalization;
    }

    public String getScale() {
        return scale;
    }

    public void setScale(String scale) {
        this.scale = scale;
    }

    public Integer getMaxComponents() {
        return maxComponents;
    }

    public void setMaxComponents(Integer maxComponents) {
        this.maxComponents = maxComponents;
    }
}
