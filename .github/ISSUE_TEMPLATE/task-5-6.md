---
name: Task 5.6 - Generasi Unit Test Otomatis
about: Implementasi auto-generate unit test untuk module yang dihasilkan CLI
title: '[TASK 5.6] Implementasi Generasi Unit Test Otomatis (Phase 4)'
labels: enhancement, cli, testing
assignees: ''
---

## 📋 Deskripsi Task

Implementasi fitur auto-generate unit test dan integration test untuk setiap module yang dihasilkan oleh CLI generator.

## 🎯 Objective

Generate file test otomatis untuk:
- Service test (unit test)
- Controller test (integration test)
- Repository test (unit test)

## 📝 Acceptance Criteria

### Template Files
- [ ] `cli/templates/backend/module/service.spec.hbs` dibuat
- [ ] `cli/templates/backend/module/controller.spec.hbs` dibuat
- [ ] `cli/templates/backend/module/repository.spec.hbs` dibuat

### Service Test Template
- [ ] Import dependencies (Testing module, service, repository)
- [ ] Mock repository methods
- [ ] Test setup dengan TestingModule
- [ ] Test case: `should be defined`
- [ ] Test case: `findAll()` returns array
- [ ] Test case: `findById()` returns single item
- [ ] Test case: `create()` creates new item
- [ ] Test case: `update()` updates existing item
- [ ] Test case: `delete()` soft deletes item

### Controller Test Template
- [ ] Import dependencies (Testing, INestApplication, request)
- [ ] Setup test app dengan supertest
- [ ] Test case: GET endpoint returns 200
- [ ] Test case: POST endpoint creates resource
- [ ] Test case: PATCH endpoint updates resource
- [ ] Test case: DELETE endpoint removes resource
- [ ] Test case: Authentication required (401)
- [ ] Test case: Permission required (403)

### Repository Test Template
- [ ] Import dependencies (Drizzle, TenantContext)
- [ ] Mock database connection
- [ ] Mock tenant context
- [ ] Test case: create() inserts to correct schema
- [ ] Test case: findAll() filters soft deleted
- [ ] Test case: soft delete sets deleted_at

### Generator Integration
- [ ] Update `crud.generator.ts` untuk generate test files
- [ ] Test files di-generate bersamaan dengan module
- [ ] Path test files: `backend/src/modules/{name}/__tests__/`

### Testing
- [ ] Generate test module dengan CLI
- [ ] Verify test files ter-generate
- [ ] Run generated tests: `npm run test`
- [ ] All generated tests pass
- [ ] Coverage minimal 80%

## 🔧 Implementation Details

**Files to Create**:
```
cli/templates/backend/module/
├── service.spec.hbs
├── controller.spec.hbs
└── repository.spec.hbs
```

**Files to Modify**:
```
cli/src/generators/crud.generator.ts
```

**Test Command**:
```bash
# Generate module dengan test
node bin/cms.js generate crud test-module

# Verify files
ls backend/src/modules/test-module/__tests__/

# Run tests
cd backend
npm run test -- test-module
```

## 📚 References

- Vitest Documentation: https://vitest.dev
- NestJS Testing: https://docs.nestjs.com/fundamentals/testing
- docs/CLI-ENTERPRISE-UPGRADE-PLAN.md - Phase 4

## ⏱️ Estimasi Waktu

**Total**: 4 jam
- Service test template: 1.5 jam
- Controller test template: 1.5 jam
- Repository test template: 1 jam

## 🏷️ Priority

**P2 - MEDIUM**

## 📌 Dependencies

- Task 5.5.2 (Phase 3.2) - ✅ COMPLETE
- Phase 3.1 & 3.2 test infrastructure

## ✅ Definition of Done

- [ ] Test templates created
- [ ] Generator integrated
- [ ] Generated tests compile
- [ ] Generated tests pass
- [ ] Real module tested (e.g., orders)
- [ ] Documentation updated
- [ ] Git commit & push
- [ ] Issue closed
