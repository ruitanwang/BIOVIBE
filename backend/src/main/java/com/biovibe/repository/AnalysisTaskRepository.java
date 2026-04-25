package com.biovibe.repository;

import com.biovibe.model.entity.AnalysisTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnalysisTaskRepository extends JpaRepository<AnalysisTask, Long> {

    List<AnalysisTask> findByUserId(Long userId);

    List<AnalysisTask> findByStatus(String status);

}
