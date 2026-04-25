package com.biovibe.service;

import com.biovibe.model.dto.AnalysisTaskDTO;
import com.biovibe.model.entity.AnalysisTask;
import com.biovibe.repository.AnalysisTaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AnalysisTaskService {

    private final AnalysisTaskRepository analysisTaskRepository;

    public List<AnalysisTask> getAllTasks() {
        return analysisTaskRepository.findAll();
    }

    public List<AnalysisTask> getTasksByUserId(Long userId) {
        return analysisTaskRepository.findByUserId(userId);
    }

    public AnalysisTask getTaskById(Long id) {
        return analysisTaskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("任务不存在"));
    }

    public AnalysisTask createTask(AnalysisTaskDTO taskDTO) {
        AnalysisTask task = new AnalysisTask();
        task.setTaskName(taskDTO.getTaskName());
        task.setAnalysisType(taskDTO.getAnalysisType());
        task.setDescription(taskDTO.getDescription());
        task.setInputFilePath(taskDTO.getInputFilePath());
        task.setStatus("pending");
        return analysisTaskRepository.save(task);
    }

    public AnalysisTask updateTaskStatus(Long id, String status) {
        AnalysisTask task = getTaskById(id);
        task.setStatus(status);
        return analysisTaskRepository.save(task);
    }

    public void deleteTask(Long id) {
        analysisTaskRepository.deleteById(id);
    }

}
