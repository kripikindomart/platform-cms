---
name: Task Module Builder 1.4
about: Create DTOs untuk Module Generator
title: '[TASK 1.4] Create DTOs untuk Module Generator'
labels: ['backend', 'P0-critical', 'enhancement']
assignees: ''
---

## Task 1.4: Create DTOs untuk Module Generator

**Sprint**: Week 1 (Days 1-2) - Backend Foundation  
**Priority**: P0 - CRITICAL  
**Estimated Time**: 2 jam  
**Dependencies**: Task 1.3 (Module Structure)  
**Status**: [PENDING] BELUM DIMULAI

---

## Objective

Membuat Data Transfer Objects (DTOs) lengkap untuk Module Generator dengan validation rules menggunakan class-validator. DTOs ini akan handle request/response untuk generate module, manage fields, dan query operations.

---

## Goals

1. Create request DTOs dengan comprehensive validation
2. Create response DTOs untuk transform entities
3. Create nested DTOs untuk complex structures (fields, validations)
4. Add Swagger documentation untuk API docs
5. Follow class-validator best practices

---

## Deliverables

### 1. Generate Module DTO
**File**: `backend/src/modules/module-generator/dto/generate-module.dto.ts`

### 2. Module Field DTO
**File**: `backend/src/modules/module-generator/dto/module-field.dto.ts`

### 3. Validation Rule DTO
**File**: `backend/src/modules/module-generator/dto/validation-rule.dto.ts`

### 4. Update Module DTO
**File**: `backend/src/modules/module-generator/dto/update-module.dto.ts`

### 5. Query Modules DTO
**File**: `backend/src/modules/module-generator/dto/query-modules.dto.ts`

### 6. Module Response DTO
**File**: `backend/src/modules/module-generator/dto/module-response.dto.ts`

### 7. Module Detail Response DTO
**File**: `backend/src/modules/module-generator/dto/module-detail-response.dto.ts`

---

## Success Criteria

**DONE when**:
- [ ] All 7 DTO files created
- [ ] Validation decorators applied
- [ ] Swagger decorators added
- [ ] Type-check passes
- [ ] Lint passes
- [ ] DTOs export di index file

---

**Created**: 2026-07-22  
**Sprint**: Week 1, Days 1-2  
**Phase**: Phase 1 - Backend Foundation
