package com.biovibe.service;

import com.biovibe.model.dto.FileInfoDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Stream;

@Service
public class FileUploadService {

    @Value("${biovibe.upload.dir:uploads}")
    private String uploadDir;

    private final AtomicLong idGenerator = new AtomicLong(0);

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            "csv", "xlsx", "xls", "tsv", "json", "fasta", "fa", "fna", "txt"
    );

    private Path getUserUploadPath(Long userId) {
        Path basePath = Paths.get(uploadDir);
        if (!basePath.isAbsolute()) {
            basePath = Paths.get(System.getProperty("user.dir")).resolve(uploadDir);
        }
        return basePath.resolve("user_" + userId);
    }

    public FileInfoDTO uploadFile(Long userId, MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("请选择文件");
        }

        String originalName = file.getOriginalFilename();
        String ext = getExtension(originalName);
        if (!ALLOWED_EXTENSIONS.contains(ext.toLowerCase())) {
            throw new IllegalArgumentException("不支持的文件类型: " + ext);
        }

        Path dirPath = getUserUploadPath(userId);
        if (!Files.exists(dirPath)) {
            Files.createDirectories(dirPath);
        }

        String baseName = originalName != null && originalName.contains(".")
                ? originalName.substring(0, originalName.lastIndexOf("."))
                : "file";
        String timestamp = String.valueOf(System.currentTimeMillis());
        String savedName = baseName + "_" + timestamp + "." + ext;

        Path filePath = dirPath.resolve(savedName);
        file.transferTo(filePath.toFile());

        long newId = idGenerator.incrementAndGet();
        return buildFileInfo(filePath.toFile(), originalName, savedName, newId);
    }

    public List<FileInfoDTO> listFiles(Long userId) throws IOException {
        Path dirPath = getUserUploadPath(userId);
        if (!Files.exists(dirPath)) {
            return new ArrayList<>();
        }

        idGenerator.set(0);

        List<FileInfoDTO> files = new ArrayList<>();
        try (Stream<Path> paths = Files.list(dirPath)) {
            paths.filter(Files::isRegularFile)
                 .sorted(Comparator.comparingLong(p -> {
                     try { return -Files.getLastModifiedTime(p).toMillis(); }
                     catch (IOException e) { return 0L; }
                 }))
                 .forEach(p -> {
                     String savedName = p.getFileName().toString();
                     String originalName = savedName.replaceFirst("_\\d+([.]\\w+)$", "$1");
                     long id = idGenerator.incrementAndGet();
                     files.add(buildFileInfo(p.toFile(), originalName, savedName, id));
                 });
        }
        return files;
    }

    private Path findFileBySavedName(Long userId, String savedName) throws IOException {
        Path dirPath = getUserUploadPath(userId);
        if (!Files.exists(dirPath)) {
            return null;
        }
        Path filePath = dirPath.resolve(savedName);
        if (Files.exists(filePath) && Files.isRegularFile(filePath)) {
            return filePath;
        }
        return null;
    }

    public boolean deleteFile(Long userId, String savedName) throws IOException {
        Path filePath = findFileBySavedName(userId, savedName);
        if (filePath == null) {
            return false;
        }
        Files.delete(filePath);
        return true;
    }

    public String readFileContent(Long userId, String savedName) throws IOException {
        Path filePath = findFileBySavedName(userId, savedName);
        if (filePath == null) {
            throw new IllegalArgumentException("文件不存在");
        }

        String ext = getExtension(savedName);
        if ("xlsx".equals(ext) || "xls".equals(ext)) {
            throw new IllegalArgumentException("Excel文件暂不支持在线预览，请下载后查看");
        }

        long fileSize = Files.size(filePath);
        if (fileSize > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("文件过大（超过5MB），暂不支持在线预览");
        }

        return Files.readString(filePath);
    }

    private FileInfoDTO buildFileInfo(File file, String originalName, String savedName, Long id) {
        long bytes = file.length();
        FileInfoDTO dto = new FileInfoDTO();
        dto.setId(id);
        dto.setName(originalName);
        dto.setSavedName(savedName);
        dto.setType(getExtension(originalName));
        dto.setSize(formatSize(bytes));
        dto.setSizeBytes(bytes);
        dto.setUploadTime(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        return dto;
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
    }

    private String formatSize(long bytes) {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return String.format("%.1f KB", bytes / 1024.0);
        return String.format("%.1f MB", bytes / (1024.0 * 1024.0));
    }
}
