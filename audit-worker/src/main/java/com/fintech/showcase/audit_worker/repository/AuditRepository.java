package com.fintech.showcase.audit_worker.repository;

import com.fintech.showcase.audit_worker.entity.AuditRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface AuditRepository extends JpaRepository<AuditRecord, UUID> {
}