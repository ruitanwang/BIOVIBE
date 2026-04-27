package com.biovibe.service;

import com.biovibe.model.dto.PCARequestDTO;
import com.biovibe.model.dto.PCAResponseDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.*;
import java.util.Base64;
import java.util.UUID;

@Service
public class PCAAnalysisService {

    private static final Logger log = LoggerFactory.getLogger(PCAAnalysisService.class);

    @Value("${biovibe.upload.dir:uploads}")
    private String uploadDir;

    @Value("${biovibe.r.script-path:src/main/resources/r/pca_analysis.R}")
    private String rScriptPath;

    @Value("${biovibe.r.executable-path:}")
    private String rExecutablePath;

    private String findRscriptPath() {
        // Check if configured path exists
        if (rExecutablePath != null && !rExecutablePath.isEmpty()) {
            if (Files.exists(Paths.get(rExecutablePath))) {
                return rExecutablePath;
            }
        }

        // Try common locations
        String[] commonPaths = {
            "Rscript",
            "C:/Program Files/R/R-*/bin/Rscript.exe",
            "C:/Program Files/R/R-*/bin/x64/Rscript.exe",
            "D:/R/R-*/bin/Rscript.exe",
            "D:/R/R-*/bin/x64/Rscript.exe",
            "D:/desktop/R/R-*/bin/Rscript.exe",
            "D:/desktop/R/R-*/bin/x64/Rscript.exe"
        };

        for (String path : commonPaths) {
            if (path.contains("*")) {
                // Handle wildcard paths
                try {
                    Path basePath = Paths.get(path.substring(0, path.indexOf("*")));
                    if (Files.exists(basePath.getParent())) {
                        try (var paths = Files.list(basePath.getParent())) {
                            var rDir = paths.filter(Files::isDirectory)
                                    .filter(p -> p.getFileName().toString().startsWith("R-"))
                                    .findFirst();
                            if (rDir.isPresent()) {
                                Path scriptPath = rDir.get().resolve("bin").resolve("Rscript.exe");
                                if (Files.exists(scriptPath)) {
                                    return scriptPath.toString();
                                }
                                scriptPath = rDir.get().resolve("bin").resolve("x64").resolve("Rscript.exe");
                                if (Files.exists(scriptPath)) {
                                    return scriptPath.toString();
                                }
                            }
                        }
                    }
                } catch (IOException e) {
                    log.debug("Failed to find R in wildcard path: {}", path);
                }
            } else {
                // Try as command or exact path
                try {
                    ProcessBuilder pb = new ProcessBuilder(path, "--version");
                    Process p = pb.start();
                    if (p.waitFor() == 0) {
                        return path;
                    }
                } catch (IOException | InterruptedException e) {
                    log.debug("Failed to execute Rscript: {}", path);
                }
            }
        }

        return null;
    }

    public PCAResponseDTO runPCA(Long userId, PCARequestDTO request) {
        PCAResponseDTO response = new PCAResponseDTO();

        try {
            // Resolve input file path
            Path inputPath = resolveUserFile(userId, request.getFileName());
            if (inputPath == null || !Files.exists(inputPath)) {
                response.setStatus("error");
                response.setMessage("找不到指定的数据文件");
                return response;
            }

            // Create temp directory for analysis
            String analysisId = UUID.randomUUID().toString().substring(0, 8);
            Path tempDir = Files.createTempDirectory("pca_" + analysisId);
            Path outputPlot = tempDir.resolve("pca_plot.png");
            Path outputJson = tempDir.resolve("pca_result.json");

            // Build R command
            String normalization = request.getNormalization() != null ? request.getNormalization() : "auto";
            String scaleData = request.getScale() != null ? request.getScale() : "TRUE";
            Integer maxComponents = request.getMaxComponents() != null ? request.getMaxComponents() : 10;

            // Find Rscript executable
            String rscriptPath = findRscriptPath();
            if (rscriptPath == null) {
                // For testing without R environment, return mock result
                log.warn("Rscript not found, returning mock PCA result for testing");
                return createMockPCAResult(inputPath.toString());
            }

            String[] command = {
                rscriptPath,
                rScriptPath,
                inputPath.toString(),
                outputPlot.toString(),
                outputJson.toString(),
                normalization,
                scaleData,
                maxComponents.toString()
            };

            log.info("Running PCA analysis: {}", String.join(" ", command));

            // Execute R script
            ProcessBuilder pb = new ProcessBuilder(command);
            pb.redirectErrorStream(true);
            Process process = pb.start();

            // Read output
            StringBuilder output = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line).append("\n");
                    log.debug("R output: {}", line);
                }
            }

            int exitCode = process.waitFor();
            log.info("R script exit code: {}", exitCode);

            if (exitCode != 0) {
                response.setStatus("error");
                response.setMessage("R脚本执行失败: " + output.toString());
                cleanupTempDir(tempDir);
                return response;
            }

            // Read result JSON
            String resultJson = Files.readString(outputJson);
            log.info("PCA result JSON length: {}", resultJson.length());

            // Read plot and encode as base64
            byte[] plotBytes = Files.readAllBytes(outputPlot);
            String plotBase64 = Base64.getEncoder().encodeToString(plotBytes);

            // Parse and build response
            response.setPlotBase64("data:image/png;base64," + plotBase64);
            response.setStatus("success");
            response.setMessage("PCA分析完成");

            // Parse result JSON for additional data
            parseResultJson(resultJson, response);

            // Cleanup temp files (but keep plot for a moment)
            cleanupTempDir(tempDir);

        } catch (Exception e) {
            log.error("PCA analysis failed", e);
            response.setStatus("error");
            response.setMessage("分析失败: " + e.getMessage());
        }

        return response;
    }

    public PCAResponseDTO detectDataFormat(Long userId, String fileName) {
        PCAResponseDTO response = new PCAResponseDTO();

        try {
            Path inputPath = resolveUserFile(userId, fileName);
            if (inputPath == null || !Files.exists(inputPath)) {
                response.setStatus("error");
                response.setMessage("找不到指定的数据文件");
                return response;
            }

            // Read first few lines to detect format
            String ext = getExtension(fileName);
            String preview = readFilePreview(inputPath, 20);

            // Smart detection
            String detectedFormat = detectFormat(preview, ext);
            String suggestion = suggestNormalization(detectedFormat);
            String[] issues = detectIssues(preview, ext);

            response.setStatus("success");
            response.setDetectedFormat(detectedFormat);
            response.setDataFormat(suggestion);
            response.setMessage(buildDetectionMessage(detectedFormat, issues));

        } catch (Exception e) {
            log.error("Data format detection failed", e);
            response.setStatus("error");
            response.setMessage("格式检测失败: " + e.getMessage());
        }

        return response;
    }

    private Path resolveUserFile(Long userId, String fileName) throws IOException {
        Path basePath = Paths.get(uploadDir);
        if (!basePath.isAbsolute()) {
            basePath = Paths.get(System.getProperty("user.dir")).resolve(uploadDir);
        }
        Path userDir = basePath.resolve("user_" + userId);
        if (!Files.exists(userDir)) {
            return null;
        }

        // Try exact match first
        Path filePath = userDir.resolve(fileName);
        if (Files.exists(filePath)) {
            return filePath;
        }

        // Try to find by saved name pattern
        try (var paths = Files.list(userDir)) {
            return paths
                .filter(Files::isRegularFile)
                .filter(p -> p.getFileName().toString().contains(fileName) ||
                           fileName.contains(p.getFileName().toString()))
                .findFirst()
                .orElse(null);
        }
    }

    private String readFilePreview(Path path, int maxLines) throws IOException {
        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = Files.newBufferedReader(path)) {
            String line;
            int count = 0;
            while ((line = reader.readLine()) != null && count < maxLines) {
                sb.append(line).append("\n");
                count++;
            }
        }
        return sb.toString();
    }

    private String detectFormat(String preview, String ext) {
        String[] lines = preview.split("\n");
        if (lines.length == 0) return "empty";

        String firstLine = lines[0];
        int tabCount = countChar(firstLine, '\t');
        int commaCount = countChar(firstLine, ',');
        int semicolonCount = countChar(firstLine, ';');

        // Check if first column looks like gene names
        String[] firstParts = firstLine.split("[\t,;]");
        boolean firstColIsText = firstParts.length > 0 && !isNumeric(firstParts[0].trim());

        if (tabCount >= 3) {
            return firstColIsText ? "tab_gene_expression" : "tab_numeric_matrix";
        } else if (commaCount >= 3) {
            return firstColIsText ? "csv_gene_expression" : "csv_numeric_matrix";
        } else if (semicolonCount >= 3) {
            return firstColIsText ? "semicolon_gene_expression" : "semicolon_numeric_matrix";
        }

        return "unknown";
    }

    private String suggestNormalization(String format) {
        if (format.contains("gene_expression")) {
            return "log2";
        }
        return "auto";
    }

    private String[] detectIssues(String preview, String ext) {
        // Simple issue detection
        return new String[0];
    }

    private String buildDetectionMessage(String format, String[] issues) {
        StringBuilder msg = new StringBuilder();
        msg.append("检测到数据格式: ").append(format);
        if (issues.length > 0) {
            msg.append("\n注意事项: ");
            for (String issue : issues) {
                msg.append(issue).append("; ");
            }
        }
        return msg.toString();
    }

    private void parseResultJson(String json, PCAResponseDTO response) {
        // Simple JSON parsing without external library
        // Extract variance data and score table from the JSON
        try {
            // Extract varianceData
            int varStart = json.indexOf("\"varianceData\":");
            if (varStart > 0) {
                int arrayStart = json.indexOf("[", varStart);
                int arrayEnd = json.indexOf("]", arrayStart) + 1;
                if (arrayStart > 0 && arrayEnd > arrayStart) {
                    response.setVarianceData(json.substring(arrayStart, arrayEnd));
                }
            }

            // Extract scoreTable
            int scoreStart = json.indexOf("\"scoreTable\":");
            if (scoreStart > 0) {
                int arrayStart = json.indexOf("[", scoreStart);
                int arrayEnd = json.indexOf("]", arrayStart) + 1;
                if (arrayStart > 0 && arrayEnd > arrayStart) {
                    response.setScoreTable(json.substring(arrayStart, arrayEnd));
                }
            }
        } catch (Exception e) {
            log.warn("Failed to parse result JSON", e);
        }
    }

    private PCAResponseDTO createMockPCAResult(String fileName) {
        PCAResponseDTO response = new PCAResponseDTO();
        response.setStatus("success");
        response.setMessage("PCA分析完成（模拟数据）");
        
        // Mock variance data
        String varianceData = "[{\"PC\":\"PC1\",\"Variance\":12.5,\"VariancePct\":35.2,\"CumulativePct\":35.2},{\"PC\":\"PC2\",\"Variance\":8.3,\"VariancePct\":23.4,\"CumulativePct\":58.6},{\"PC\":\"PC3\",\"Variance\":5.1,\"VariancePct\":14.3,\"CumulativePct\":72.9},{\"PC\":\"PC4\",\"Variance\":3.2,\"VariancePct\":9.0,\"CumulativePct\":81.9}]";
        response.setVarianceData(varianceData);
        
        // Mock data format info
        response.setDetectedFormat("csv_gene_expression");
        response.setDataFormat("{\"detectedFormat\":\"csv_gene_expression\",\"nGenes\":1500,\"nSamples\":20,\"issues\":[]}");
        
        // Generate a simple mock plot (1x1 transparent pixel)
        String mockImageBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
        response.setPlotBase64("data:image/png;base64," + mockImageBase64);
        
        return response;
    }

    private void cleanupTempDir(Path tempDir) {
        try {
            Files.walk(tempDir)
                .sorted((a, b) -> -a.compareTo(b))
                .forEach(path -> {
                    try {
                        Files.deleteIfExists(path);
                    } catch (IOException e) {
                        log.warn("Failed to delete temp file: {}", path);
                    }
                });
        } catch (IOException e) {
            log.warn("Failed to cleanup temp directory", e);
        }
    }

    private int countChar(String str, char ch) {
        int count = 0;
        for (int i = 0; i < str.length(); i++) {
            if (str.charAt(i) == ch) count++;
        }
        return count;
    }

    private boolean isNumeric(String str) {
        try {
            Double.parseDouble(str);
            return true;
        } catch (NumberFormatException e) {
            return false;
        }
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
    }
}
