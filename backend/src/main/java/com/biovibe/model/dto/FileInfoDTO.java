package com.biovibe.model.dto;

public class FileInfoDTO {

    private Long id;
    private String name;
    private String savedName;
    private String type;
    private String size;
    private Long sizeBytes;
    private String uploadTime;

    public FileInfoDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getSavedName() { return savedName; }
    public void setSavedName(String savedName) { this.savedName = savedName; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }
    public Long getSizeBytes() { return sizeBytes; }
    public void setSizeBytes(Long sizeBytes) { this.sizeBytes = sizeBytes; }
    public String getUploadTime() { return uploadTime; }
    public void setUploadTime(String uploadTime) { this.uploadTime = uploadTime; }
}
