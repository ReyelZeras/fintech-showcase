package com.fintech.showcase.audit_worker.repository;

import com.fintech.showcase.audit_worker.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {}