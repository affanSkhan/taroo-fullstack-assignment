# Bug Report

## Bug 1 — Pagination skips page 1

**Location:** `task-api/src/services/taskService.js` → `getPaginated`

**Expected:** `page=1&limit=2` returns the first two tasks.

**Actual:** The original code calculated `offset = page * limit`, so page 1 began at array index 2.

**Discovery:** A regression test seeds three tasks and requests the first page. The original implementation returns the third task instead of the first two.

**Fix:** Convert one-indexed API pages to zero-indexed array offsets with `(page - 1) * limit`.

---

## Bug 2 — Status filter performs substring matching

**Location:** `task-api/src/services/taskService.js` → `getByStatus`

**Expected:** Status filtering matches the complete enum value.

**Actual:** The original code used `task.status.includes(status)`, treating the enum as a substring search.

**Discovery:** Tests exercise exact filtering and invalid status query values.

**Fix:** Match with strict equality and validate the query against supported statuses.

---

## Bug 3 — Completing a task changes priority

**Location:** `task-api/src/services/taskService.js` → `completeTask`

**Expected:** Completion changes completion-related fields while preserving unrelated task data.

**Actual:** The original code explicitly changed priority to `medium`.

**Discovery:** A regression test creates a high-priority task, completes it, and verifies priority remains `high`.

**Fix:** Remove the unrelated priority mutation.

---

## Contract hardening

The original implementation was permissive around pagination and some task fields. The completed version makes the API contract explicit: status and priority are finite enums; title and assignee must be non-empty strings; dueDate must parse as a date when supplied; pagination values must be positive integers; malformed status filters receive `400`.

These behaviors are covered by integration tests.
