package com.biovibe.controller;

import com.biovibe.common.Result;
import com.biovibe.model.dto.FileInfoDTO;
import com.biovibe.service.FileUploadService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api")
public class FileUploadController {

    private final FileUploadService fileUploadService;

    public FileUploadController(FileUploadService fileUploadService) {
        this.fileUploadService = fileUploadService;
    }

    private Long getUserId(HttpServletRequest request) {
        return (Long) request.getAttribute("userId");
    }

    @PostMapping("/upload")
    public Result<FileInfoDTO> upload(@RequestParam("file") MultipartFile file,
                                      HttpServletRequest request) throws IOException {
        Long userId = getUserId(request);
        FileInfoDTO fileInfo = fileUploadService.uploadFile(userId, file);
        return Result.success("上传成功", fileInfo);
    }

    @GetMapping("/files")
    public Result<List<FileInfoDTO>> listFiles(HttpServletRequest request) throws IOException {
        Long userId = getUserId(request);
        List<FileInfoDTO> files = fileUploadService.listFiles(userId);
        return Result.success(files);
    }

    @DeleteMapping("/files/{savedName}")
    public Result<Void> deleteFile(@PathVariable String savedName,
                                   HttpServletRequest request) throws IOException {
        Long userId = getUserId(request);
        String decoded = URLDecoder.decode(savedName, StandardCharsets.UTF_8);
        boolean deleted = fileUploadService.deleteFile(userId, decoded);
        if (deleted) {
            return Result.success("删除成功", null);
        }
        return Result.error(404, "文件不存在");
    }

    @GetMapping("/health")
    public Result<String> health() {
        return Result.success("BIOVIBE后端服务运行正常");
    }

    @GetMapping("/files/{savedName}/content")
    public Result<String> getFileContent(@PathVariable String savedName,
                                         HttpServletRequest request) throws IOException {
        Long userId = getUserId(request);
        String decoded = URLDecoder.decode(savedName, StandardCharsets.UTF_8);
        String content = fileUploadService.readFileContent(userId, decoded);
        return Result.success(content);
    }
}
