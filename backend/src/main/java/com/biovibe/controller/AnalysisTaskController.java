package com.biovibe.controller;

import com.biovibe.common.Result;
import com.biovibe.model.dto.AnalysisTaskDTO;
import com.biovibe.model.entity.AnalysisTask;
import com.biovibe.service.AnalysisTaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class AnalysisTaskController {

    private final AnalysisTaskService analysisTaskService;

    @GetMapping
    public Result<List<AnalysisTask>> getAllTasks() {
        return Result.success(analysisTaskService.getAllTasks());
    }

    @GetMapping("/{id}")
    public Result<AnalysisTask> getTaskById(@PathVariable Long id) {
        return Result.success(analysisTaskService.getTaskById(id));
    }

    @GetMapping("/user/{userId}")
    public Result<List<AnalysisTask>> getTasksByUserId(@PathVariable Long userId) {
        return Result.success(analysisTaskService.getTasksByUserId(userId));
    }

    @PostMapping
    public Result<AnalysisTask> createTask(@Valid @RequestBody AnalysisTaskDTO taskDTO) {
        return Result.success(analysisTaskService.createTask(taskDTO));
    }

    @PutMapping("/{id}/status")
    public Result<AnalysisTask> updateTaskStatus(@PathVariable Long id, @RequestParam String status) {
        return Result.success(analysisTaskService.updateTaskStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public Result<Void> deleteTask(@PathVariable Long id) {
        analysisTaskService.deleteTask(id);
        return Result.success();
    }

}
