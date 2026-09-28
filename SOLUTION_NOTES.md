# Solution Notes

## Assignment semantics

The new `PATCH /tasks/:id/assign` endpoint stores a human-readable assignee name on the task.

A task that already has an assignee returns **409 Conflict** rather than silently replacing ownership. The assignment explicitly asks us to consider that case; making the conflict visible is safer than an implicit overwrite.

A future production API could expose an explicit reassignment operation or require authorization for ownership changes.

## Validation

Assignee names are trimmed and must contain at least one non-whitespace character.

Existing task validation remains strict for status and priority enums and validates due dates.

Pagination is one-indexed at the API boundary (`page=1` means first page) and translated to a zero-indexed array offset internally.

## Testing approach

Tests target behavior instead of implementation details.

Unit tests cover task creation, lookup, filtering, pagination, statistics, updating, deletion, completion, assignment, not-found behavior and state preservation.

Integration tests cover every endpoint through Express + Supertest, including success responses, validation failures, missing resources, pagination and assignment conflicts.

## What I would test next

With more time I would add property-based tests for pagination/validation, explicit API schema tests, tests around concurrent writes once persistence exists, and failure-path tests for a real repository/database layer.

## What surprised me

The codebase is small, but multiple defects alter legitimate user data or API results without necessarily causing an obvious server error. That made regression tests around state preservation and boundary values particularly valuable.

## Questions before production

1. Is PUT intended to replace a complete resource or behave as a partial update?
2. Should reassignment be conflict, idempotent success, or an authorized explicit operation?
3. Should ownership reference a stable user ID instead of a display name?
4. What authentication and authorization rules apply?
5. What pagination response shape should external clients depend on?
6. What timezone semantics are required for dueDate/overdue calculations?
7. What persistence, rate limiting, logging and monitoring requirements are expected?

## Scope discipline

The assignment architecture is intentionally kept simple. No database, authentication system or unrelated framework migration was added. The goal is to demonstrate careful code reading, behavior-first testing, focused debugging and a well-reasoned feature implementation.
