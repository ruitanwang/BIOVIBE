#!/usr/bin/env Rscript

# BIOVIBE PCA Analysis Script
# Intelligent data format detection and PCA analysis

suppressPackageStartupMessages({
  library(jsonlite)
  library(methods)
})

args <- commandArgs(trailingOnly = TRUE)

if (length(args) < 3) {
  cat(toJSON(list(
    status = "error",
    message = "参数不足: 需要 input_file, output_plot, output_json"
  ), auto_unbox = TRUE))
  quit(status = 1)
}

input_file <- args[1]
output_plot <- args[2]
output_json <- args[3]

# Optional parameters
normalization <- if (length(args) >= 4) args[4] else "auto"
scale_data <- if (length(args) >= 5) args[5] else "TRUE"
max_components <- if (length(args) >= 6) as.integer(args[6]) else 10

# ============================================================
# Intelligent Data Format Detection
# ============================================================

detect_and_load_data <- function(file_path) {
  ext <- tolower(tools::file_ext(file_path))
  
  # Read file content for detection
  raw_lines <- readLines(file_path, n = 20, warn = FALSE)
  raw_lines <- raw_lines[nchar(trimws(raw_lines)) > 0]
  
  # Detect delimiter
  tab_count <- sum(grepl("\t", raw_lines[1:5]))
  comma_count <- sum(grepl(",", raw_lines[1:5]))
  semicolon_count <- sum(grepl(";", raw_lines[1:5]))
  
  delimiter <- if (tab_count >= 3) "\t" else if (semicolon_count >= 3) ";" else ","
  
  # Load data based on extension
  if (ext %in% c("csv", "txt", "tsv")) {
    data <- tryCatch({
      read.csv(file_path, sep = delimiter, header = TRUE, 
               row.names = NULL, check.names = FALSE, stringsAsFactors = FALSE)
    }, error = function(e) {
      tryCatch({
        read.delim(file_path, header = TRUE, row.names = NULL, 
                   check.names = FALSE, stringsAsFactors = FALSE)
      }, error = function(e2) {
        NULL
      })
    })
  } else if (ext %in% c("xlsx", "xls")) {
    if (!requireNamespace("openxlsx", quietly = TRUE)) {
      stop("需要安装 openxlsx 包来读取Excel文件")
    }
    data <- openxlsx::read.xlsx(file_path)
  } else {
    stop(paste("不支持的文件格式:", ext))
  }
  
  if (is.null(data) || nrow(data) < 2 || ncol(data) < 2) {
    stop("数据格式不正确: 至少需要2行2列")
  }
  
  return(list(data = data, delimiter = delimiter, ext = ext))
}

# ============================================================
# Smart Data Format Recognition and Conversion
# ============================================================

recognize_and_convert <- function(data) {
  result <- list(
    matrix = NULL,
    format_type = "unknown",
    gene_column = NULL,
    sample_names = NULL,
    gene_names = NULL,
    is_transposed = FALSE,
    confidence = 0,
    issues = c()
  )
  
  col_names <- colnames(data)
  n_rows <- nrow(data)
  n_cols <- ncol(data)
  
  # Strategy 1: First column might be gene/sample identifiers
  first_col <- data[[1]]
  first_col_is_char <- is.character(first_col) || is.factor(first_col)
  first_col_has_mixed <- !all(suppressWarnings(!is.na(as.numeric(as.character(first_col)))))
  
  # Strategy 2: Check if data is numeric (excluding first column)
  numeric_cols <- sapply(data[, -1, drop = FALSE], function(x) {
    mean(suppressWarnings(!is.na(as.numeric(as.character(x)))))
  })
  
  numeric_ratio <- mean(numeric_cols)
  
  # Strategy 3: Detect orientation (genes as rows vs columns)
  # Common bioinformatics formats:
  # Format A: Rows=Genes, Columns=Samples (most common)
  # Format B: Rows=Samples, Columns=Genes (transposed)
  
  format_detected <- FALSE
  
  # Check Format A: First column = gene names, rest = numeric expression values
  if (first_col_is_char || first_col_has_mixed) {
    if (numeric_ratio > 0.8) {
      # Likely Format A: gene_expression matrix
      gene_ids <- as.character(data[[1]])
      numeric_data <- data[, -1, drop = FALSE]
      
      # Convert all columns to numeric
      for (j in seq_len(ncol(numeric_data))) {
        numeric_data[[j]] <- suppressWarnings(as.numeric(as.character(numeric_data[[j]])))
      }
      
      result$matrix <- as.matrix(numeric_data)
      rownames(result$matrix) <- gene_ids
      result$format_type <- "gene_expression"
      result$gene_column <- col_names[1]
      result$sample_names <- col_names[-1]
      result$gene_names <- gene_ids
      result$is_transposed <- FALSE
      result$confidence <- 0.9
      format_detected <- TRUE
    }
  }
  
  # Check if entire matrix is numeric (no identifier column)
  if (!format_detected) {
    all_numeric <- sapply(data, function(x) {
      mean(suppressWarnings(!is.na(as.numeric(as.character(x)))))
    })
    
    if (mean(all_numeric) > 0.95) {
      # Pure numeric matrix - need to determine orientation
      # Heuristic: if nrow > ncol, likely genes as rows
      if (n_rows > n_cols) {
        result$matrix <- as.matrix(data)
        for (j in seq_len(ncol(result$matrix))) {
          result$matrix[, j] <- suppressWarnings(as.numeric(result$matrix[, j]))
        }
        rownames(result$matrix) <- paste0("Feature_", seq_len(n_rows))
        result$format_type <- "numeric_matrix_genes_rows"
        result$sample_names <- col_names
        result$gene_names <- rownames(result$matrix)
        result$is_transposed <- FALSE
        result$confidence <- 0.6
        result$issues <- c("未检测到基因名列，已自动添加Feature_前缀")
      } else {
        # Might be transposed (samples as rows, genes as columns)
        result$matrix <- as.matrix(data)
        for (j in seq_len(ncol(result$matrix))) {
          result$matrix[, j] <- suppressWarnings(as.numeric(result$matrix[, j]))
        }
        rownames(result$matrix) <- paste0("Sample_", seq_len(n_rows))
        result$format_type <- "numeric_matrix_samples_rows"
        result$sample_names <- rownames(result$matrix)
        result$gene_names <- col_names
        result$is_transposed <- TRUE
        result$confidence <- 0.5
        result$issues <- c("数据可能为转置格式（行为样本，列为基因），请确认")
      }
      format_detected <- TRUE
    }
  }
  
  # Check for common header patterns
  if (!format_detected) {
    # Look for common bioinformatics column names
    gene_patterns <- c("gene", "Gene", "GENE", "gene_id", "GeneID", "gene_name", "symbol", "Symbol", "SYMBOL", "EntrezID", "ensembl")
    sample_patterns <- c("sample", "Sample", "SAMPLE", "group", "Group", "condition", "Condition", "treatment", "Treatment")
    
    has_gene_col <- any(sapply(gene_patterns, function(p) any(grepl(p, col_names, ignore.case = TRUE))))
    has_sample_info <- any(sapply(sample_patterns, function(p) any(grepl(p, col_names, ignore.case = TRUE))))
    
    if (has_gene_col) {
      gene_col_idx <- which(sapply(gene_patterns, function(p) grepl(p, col_names[1], ignore.case = TRUE)))[1]
      if (!is.na(gene_col_idx)) {
        gene_ids <- as.character(data[[1]])
        numeric_data <- data[, -1, drop = FALSE]
        
        for (j in seq_len(ncol(numeric_data))) {
          numeric_data[[j]] <- suppressWarnings(as.numeric(as.character(numeric_data[[j]])))
        }
        
        result$matrix <- as.matrix(numeric_data)
        rownames(result$matrix) <- gene_ids
        result$format_type <- "gene_expression_named"
        result$gene_column <- col_names[1]
        result$sample_names <- col_names[-1]
        result$gene_names <- gene_ids
        result$is_transposed <- FALSE
        result$confidence <- 0.95
        format_detected <- TRUE
      }
    }
  }
  
  # Fallback: try to use whatever we have
  if (!format_detected) {
    # Try to convert everything to numeric
    test_matrix <- as.matrix(data)
    for (j in seq_len(ncol(test_matrix))) {
      test_matrix[, j] <- suppressWarnings(as.numeric(test_matrix[, j]))
    }
    
    non_na_ratio <- sum(!is.na(test_matrix)) / length(test_matrix)
    
    if (non_na_ratio > 0.7) {
      result$matrix <- test_matrix
      rownames(result$matrix) <- paste0("Row_", seq_len(nrow(data)))
      result$format_type <- "fallback_numeric"
      result$sample_names <- col_names
      result$gene_names <- rownames(result$matrix)
      result$is_transposed <- FALSE
      result$confidence <- 0.3
      result$issues <- c("数据格式不明确，已尝试转换为数值矩阵")
    } else {
      stop("无法识别数据格式，请检查数据是否为数值型表达矩阵")
    }
  }
  
  # Clean the matrix: replace NA with 0, remove all-zero rows
  result$matrix[is.na(result$matrix)] <- 0
  
  zero_rows <- rowSums(abs(result$matrix)) == 0
  if (any(zero_rows)) {
    result$matrix <- result$matrix[!zero_rows, , drop = FALSE]
    result$issues <- c(result$issues, paste("已移除", sum(zero_rows), "个全零行"))
  }
  
  return(result)
}

# ============================================================
# Apply Normalization
# ============================================================

apply_normalization <- function(mat, method) {
  if (method == "none" || method == "raw") {
    return(mat)
  }
  
  if (method == "log2") {
    mat <- log2(mat + 1)
    return(mat)
  }
  
  if (method == "log10") {
    mat <- log10(mat + 1)
    return(mat)
  }
  
  if (method == "zscore" || method == "scale") {
    mat <- t(scale(t(mat)))
    mat[is.na(mat)] <- 0
    return(mat)
  }
  
  # Auto detection: check if data needs log transformation
  if (method == "auto") {
    max_val <- max(mat)
    mean_val <- mean(mat)
    
    # If data has very large values (raw counts), apply log2
    if (max_val > 1000 || mean_val > 100) {
      mat <- log2(mat + 1)
    }
    
    return(mat)
  }
  
  return(mat)
}

# ============================================================
# PCA Analysis
# ============================================================

run_pca <- function(mat, scale_data, max_components) {
  # Transpose: PCA on samples (columns become observations)
  mat_t <- t(mat)
  
  # Remove columns with zero variance
  variances <- apply(mat_t, 2, var)
  zero_var <- variances == 0 | is.na(variances)
  if (any(zero_var)) {
    mat_t <- mat_t[, !zero_var, drop = FALSE]
  }
  
  # Check if we have enough samples
  n_samples <- nrow(mat_t)
  n_features <- ncol(mat_t)
  
  if (n_samples < 2) {
    stop("样本数量不足，至少需要2个样本")
  }
  
  # Determine number of components
  n_components <- min(max_components, n_samples - 1, n_features)
  n_components <- max(2, n_components)
  
  # Run PCA
  pca_result <- prcomp(mat_t, scale. = (scale_data == "TRUE"), center = TRUE)
  
  # Extract results
  scores <- pca_result$x[, 1:min(n_components, ncol(pca_result$x)), drop = FALSE]
  loadings <- pca_result$rotation[, 1:min(n_components, ncol(pca_result$rotation)), drop = FALSE]
  variance <- pca_result$sdev^2
  variance_pct <- variance / sum(variance) * 100
  
  return(list(
    scores = scores,
    loadings = loadings,
    variance = variance,
    variance_pct = variance_pct,
    n_components = n_components,
    n_samples = n_samples,
    n_features = n_features
  ))
}

# ============================================================
# Generate PCA Plot
# ============================================================

generate_pca_plot <- function(pca_result, output_path) {
  scores <- pca_result$scores
  
  # Determine plot dimensions
  png(output_path, width = 1200, height = 900, res = 150, bg = "white")
  
  par(mfrow = c(2, 2), mar = c(5, 5, 4, 2), cex = 0.9)
  
  # Plot 1: PC1 vs PC2
  pc1_var <- round(pca_result$variance_pct[1], 1)
  pc2_var <- round(pca_result$variance_pct[2], 1)
  
  plot(scores[, 1], scores[, 2],
       xlab = paste0("PC1 (", pc1_var, "%)"),
       ylab = paste0("PC2 (", pc2_var, "%)"),
       main = "PCA Score Plot",
       pch = 19, cex = 1.5,
       col = rgb(253, 203, 110, 150, maxColorValue = 255),
       bg = rgb(253, 203, 110, 100, maxColorValue = 255))
  
  # Add sample labels
  if (nrow(scores) <= 30) {
    text(scores[, 1], scores[, 2], labels = rownames(scores), 
         pos = 3, cex = 0.7, col = "#e17055")
  }
  
  # Add ellipse (simple implementation without external package)
  if (nrow(scores) >= 3) {
    # Simple confidence ellipse using basic R
    cov_matrix <- cov(scores[, 1:2])
    center <- c(mean(scores[, 1]), mean(scores[, 2]))
    radius <- sqrt(qchisq(0.95, df = 2))
    
    # Generate ellipse points
    angles <- seq(0, 2 * pi, length.out = 100)
    eigen_decomp <- eigen(cov_matrix)
    axes <- radius * sqrt(eigen_decomp$values)
    rotation_matrix <- eigen_decomp$vectors
    
    ellipse_x <- center[1] + axes[1] * cos(angles) * rotation_matrix[1, 1] + 
                 axes[2] * sin(angles) * rotation_matrix[1, 2]
    ellipse_y <- center[2] + axes[1] * cos(angles) * rotation_matrix[2, 1] + 
                 axes[2] * sin(angles) * rotation_matrix[2, 2]
    
    polygon(ellipse_x, ellipse_y, 
            col = rgb(225, 112, 85, 50, maxColorValue = 255),
            border = "#e17055", lwd = 2)
  }
  
  grid(col = "lightgray", lty = 2)
  
  # Plot 2: PC3 vs PC4 (if available)
  if (ncol(scores) >= 4) {
    pc3_var <- round(pca_result$variance_pct[3], 1)
    pc4_var <- round(pca_result$variance_pct[4], 1)
    
    plot(scores[, 3], scores[, 4],
         xlab = paste0("PC3 (", pc3_var, "%)"),
         ylab = paste0("PC4 (", pc4_var, "%)"),
         main = "PC3 vs PC4",
         pch = 19, cex = 1.2,
         col = rgb(253, 203, 110, 150, maxColorValue = 255))
    
    if (nrow(scores) <= 30) {
      text(scores[, 3], scores[, 4], labels = rownames(scores), 
           pos = 3, cex = 0.6, col = "#e17055")
    }
    grid(col = "lightgray", lty = 2)
  } else {
    plot(0, 0, type = "n", xlab = "", ylab = "", main = "", axes = FALSE)
    text(0, 0, "PC3/PC4 not available", cex = 1.2, col = "gray")
  }
  
  # Plot 3: Scree plot
  n_show <- min(10, length(pca_result$variance_pct))
  barplot(pca_result$variance_pct[1:n_show],
          main = "Variance Explained by Each PC",
          xlab = "Principal Component",
          ylab = "Variance Explained (%)",
          col = rgb(253, 203, 110, 200, maxColorValue = 255),
          border = "#e17055",
          names.arg = paste0("PC", 1:n_show))
  
  # Plot 4: Cumulative variance
  cum_var <- cumsum(pca_result$variance_pct)
  plot(1:length(cum_var), cum_var,
       type = "b", pch = 19, cex = 1.2,
       col = "#e17055", lwd = 2,
       xlab = "Number of PCs",
       ylab = "Cumulative Variance (%)",
       main = "Cumulative Variance Explained",
       ylim = c(0, 100))
  abline(h = 80, lty = 2, col = "gray")
  text(length(cum_var), 80, "80%", pos = 2, col = "gray")
  grid(col = "lightgray", lty = 2)
  
  dev.off()
}

# ============================================================
# Main Execution
# ============================================================

tryCatch({
  # Step 1: Load and detect data format
  loaded <- detect_and_load_data(input_file)
  
  # Step 2: Recognize and convert to standard format
  converted <- recognize_and_convert(loaded$data)
  
  # Step 3: Apply normalization
  normalized_mat <- apply_normalization(converted$matrix, normalization)
  
  # Step 4: Run PCA
  pca_res <- run_pca(normalized_mat, scale_data, max_components)
  
  # Step 5: Generate plot
  generate_pca_plot(pca_res, output_plot)
  
  # Step 6: Prepare output JSON
  # Note: base64 encoding will be done in Java
  plot_path <- normalizePath(output_plot)
  
  # Prepare scores table
  scores_df <- as.data.frame(pca_res$scores)
  scores_json <- toJSON(scores_df, digits = 6)
  
  # Prepare variance data
  variance_df <- data.frame(
    PC = paste0("PC", seq_along(pca_res$variance_pct)),
    Variance = round(pca_res$variance, 4),
    VariancePct = round(pca_res$variance_pct, 2),
    CumulativePct = round(cumsum(pca_res$variance_pct), 2)
  )
  variance_json <- toJSON(variance_df, digits = 4)
  
  # Prepare metadata
  output <- list(
    status = "success",
    message = "PCA分析完成",
    plotPath = plot_path,
    varianceData = variance_json,
    scoreTable = scores_json,
    dataFormat = list(
      detectedFormat = converted$format_type,
      confidence = converted$confidence,
      nGenes = nrow(normalized_mat),
      nSamples = ncol(normalized_mat),
      isTransposed = converted$is_transposed,
      issues = converted$issues
    )
  )
  
  writeLines(toJSON(output, auto_unbox = TRUE, digits = 6), output_json)
  
  cat("PCA analysis completed successfully\n")
  
}, error = function(e) {
  error_output <- list(
    status = "error",
    message = conditionMessage(e)
  )
  writeLines(toJSON(error_output, auto_unbox = TRUE), output_json)
  cat(paste("Error:", conditionMessage(e), "\n"))
  quit(status = 1)
})
