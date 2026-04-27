package com.biovibe.model.dto;

public class PCAResponseDTO {
    private String status;
    private String message;
    private String plotBase64;
    private String varianceData;
    private String scoreTable;
    private String dataFormat;
    private String detectedFormat;
    private Boolean needsConfirmation;
    private String confirmationQuestion;
    private String[] confirmationOptions;

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getPlotBase64() {
        return plotBase64;
    }

    public void setPlotBase64(String plotBase64) {
        this.plotBase64 = plotBase64;
    }

    public String getVarianceData() {
        return varianceData;
    }

    public void setVarianceData(String varianceData) {
        this.varianceData = varianceData;
    }

    public String getScoreTable() {
        return scoreTable;
    }

    public void setScoreTable(String scoreTable) {
        this.scoreTable = scoreTable;
    }

    public String getDataFormat() {
        return dataFormat;
    }

    public void setDataFormat(String dataFormat) {
        this.dataFormat = dataFormat;
    }

    public String getDetectedFormat() {
        return detectedFormat;
    }

    public void setDetectedFormat(String detectedFormat) {
        this.detectedFormat = detectedFormat;
    }

    public Boolean getNeedsConfirmation() {
        return needsConfirmation;
    }

    public void setNeedsConfirmation(Boolean needsConfirmation) {
        this.needsConfirmation = needsConfirmation;
    }

    public String getConfirmationQuestion() {
        return confirmationQuestion;
    }

    public void setConfirmationQuestion(String confirmationQuestion) {
        this.confirmationQuestion = confirmationQuestion;
    }

    public String[] getConfirmationOptions() {
        return confirmationOptions;
    }

    public void setConfirmationOptions(String[] confirmationOptions) {
        this.confirmationOptions = confirmationOptions;
    }
}
