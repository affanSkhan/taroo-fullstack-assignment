const {
  validateCreateTask,
  validateUpdateTask,
  validateAssignTask,
  validatePagination
} = require('../src/utils/validators');

describe('validators', () => {
  describe('validateCreateTask', () => {
    test('accepts a valid minimal task', () => {
      expect(validateCreateTask({ title: 'Task' })).toBeNull();
    });

    test('rejects missing or blank title', () => {
      expect(validateCreateTask({})).toMatch(/title is required/);
      expect(validateCreateTask({ title: '   ' })).toMatch(/title is required/);
      expect(validateCreateTask({ title: 123 })).toMatch(/title is required/);
    });

    test('rejects invalid optional fields', () => {
      expect(validateCreateTask({ title: 'Task', description: 10 })).toMatch(
        /description must be a string/
      );
      expect(validateCreateTask({ title: 'Task', status: 'queued' })).toMatch(
        /status must be one of/
      );
      expect(validateCreateTask({ title: 'Task', priority: 'urgent' })).toMatch(
        /priority must be one of/
      );
      expect(validateCreateTask({ title: 'Task', dueDate: 'not-a-date' })).toMatch(
        /dueDate must be a valid/
      );
      expect(validateCreateTask({ title: 'Task', assignee: '   ' })).toMatch(
        /assignee must be a non-empty/
      );
    });

    test('accepts null dueDate and assignee', () => {
      expect(
        validateCreateTask({ title: 'Task', dueDate: null, assignee: null })
      ).toBeNull();
    });
  });

  describe('validateUpdateTask', () => {
    test('accepts valid partial updates', () => {
      expect(
        validateUpdateTask({
          title: 'Updated',
          description: 'New description',
          status: 'done',
          priority: 'high',
          dueDate: new Date().toISOString(),
          assignee: 'User'
        })
      ).toBeNull();
    });

    test('rejects invalid title/description/status/priority/date/assignee', () => {
      expect(validateUpdateTask({ title: '' })).toMatch(/title must be/);
      expect(validateUpdateTask({ description: 1 })).toMatch(
        /description must be/
      );
      expect(validateUpdateTask({ status: 'bad' })).toMatch(/status must be/);
      expect(validateUpdateTask({ priority: 'bad' })).toMatch(/priority must be/);
      expect(validateUpdateTask({ dueDate: 'bad' })).toMatch(/dueDate must be/);
      expect(validateUpdateTask({ assignee: '' })).toMatch(/assignee must be/);
    });
  });

  describe('validateAssignTask', () => {
    test('requires a non-empty string assignee', () => {
      expect(validateAssignTask({ assignee: 'Affan' })).toBeNull();
      expect(validateAssignTask({ assignee: '  Affan  ' })).toBeNull();
      expect(validateAssignTask({})).toMatch(/assignee is required/);
      expect(validateAssignTask({ assignee: '   ' })).toMatch(/assignee is required/);
      expect(validateAssignTask({ assignee: 123 })).toMatch(/assignee is required/);
    });
  });

  describe('validatePagination', () => {
    test('accepts omitted and positive integer values', () => {
      expect(validatePagination(undefined, undefined)).toBeNull();
      expect(validatePagination('1', '10')).toBeNull();
    });

    test('rejects zero, negative, decimal and non-numeric values', () => {
      expect(validatePagination('0', '10')).toMatch(/page must be/);
      expect(validatePagination('-1', '10')).toMatch(/page must be/);
      expect(validatePagination('1.5', '10')).toMatch(/page must be/);
      expect(validatePagination('1', '0')).toMatch(/limit must be/);
      expect(validatePagination('1', '-1')).toMatch(/limit must be/);
      expect(validatePagination('1', 'abc')).toMatch(/limit must be/);
    });
  });
});
