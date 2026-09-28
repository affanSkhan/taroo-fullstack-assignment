const taskService = require('../src/services/taskService');

describe('taskService', () => {
  beforeEach(() => {
    taskService._reset();
  });

  const makeTask = (overrides = {}) =>
    taskService.create({
      title: 'Test task',
      description: 'Description',
      ...overrides
    });

  test('creates a task with defaults and generated timestamps/id', () => {
    const task = makeTask({ title: '  Trim me  ' });

    expect(task).toEqual(
      expect.objectContaining({
        title: 'Trim me',
        description: 'Description',
        status: 'todo',
        priority: 'medium',
        dueDate: null,
        assignee: null,
        completedAt: null
      })
    );
    expect(task.id).toEqual(expect.any(String));
    expect(new Date(task.createdAt).toISOString()).toBe(task.createdAt);
  });

  test('returns a copy from getAll', () => {
    const task = makeTask();
    const all = taskService.getAll();

    expect(all).toHaveLength(1);
    expect(all[0]).toEqual(task);
    expect(all).not.toBe(task);
  });

  test('finds task by id and returns undefined for missing id', () => {
    const task = makeTask();

    expect(taskService.findById(task.id)).toEqual(task);
    expect(taskService.findById('missing')).toBeUndefined();
  });

  test('filters by exact status', () => {
    makeTask({ title: 'todo', status: 'todo' });
    makeTask({ title: 'done', status: 'done' });

    expect(taskService.getByStatus('todo')).toHaveLength(1);
    expect(taskService.getByStatus('todo')[0].status).toBe('todo');
    expect(taskService.getByStatus('to')).toHaveLength(0);
  });

  test('paginates using one-indexed page numbers', () => {
    const first = makeTask({ title: 'first' });
    const second = makeTask({ title: 'second' });
    const third = makeTask({ title: 'third' });

    expect(taskService.getPaginated(1, 2).map((task) => task.id)).toEqual([
      first.id,
      second.id
    ]);
    expect(taskService.getPaginated(2, 2).map((task) => task.id)).toEqual([
      third.id
    ]);
    expect(taskService.getPaginated(100, 2)).toEqual([]);
  });

  test('falls back to safe pagination defaults', () => {
    makeTask({ title: 'first' });
    makeTask({ title: 'second' });

    expect(taskService.getPaginated(0, 0)).toHaveLength(2);
    expect(taskService.getPaginated(-1, -10)).toHaveLength(2);
  });

  test('calculates status counts and overdue tasks', () => {
    makeTask({ status: 'todo', dueDate: new Date(Date.now() - 60_000).toISOString() });
    makeTask({ status: 'in_progress', dueDate: new Date(Date.now() + 60_000).toISOString() });
    makeTask({ status: 'done', dueDate: new Date(Date.now() - 60_000).toISOString() });

    expect(taskService.getStats()).toEqual({
      todo: 1,
      in_progress: 1,
      done: 1,
      overdue: 1
    });
  });

  test('returns zero stats for an empty store', () => {
    expect(taskService.getStats()).toEqual({
      todo: 0,
      in_progress: 0,
      done: 0,
      overdue: 0
    });
  });

  test('updates an existing task without replacing unrelated fields', () => {
    const task = makeTask({ priority: 'high' });

    const updated = taskService.update(task.id, { title: 'Updated' });

    expect(updated).toEqual({ ...task, title: 'Updated' });
    expect(taskService.update('missing', { title: 'Nope' })).toBeNull();
  });

  test('removes an existing task', () => {
    const task = makeTask();

    expect(taskService.remove(task.id)).toBe(true);
    expect(taskService.findById(task.id)).toBeUndefined();
    expect(taskService.remove(task.id)).toBe(false);
  });

  test('completes task and preserves priority', () => {
    const task = makeTask({ priority: 'high', status: 'in_progress' });

    const completed = taskService.completeTask(task.id);

    expect(completed.status).toBe('done');
    expect(completed.priority).toBe('high');
    expect(completed.completedAt).toEqual(expect.any(String));
    expect(new Date(completed.completedAt).toISOString()).toBe(
      completed.completedAt
    );
    expect(taskService.completeTask('missing')).toBeNull();
  });

  test('assigns an unassigned task', () => {
    const task = makeTask();

    const result = taskService.assignTask(task.id, 'Affan Khan');

    expect(result).toEqual({
      kind: 'assigned',
      task: { ...task, assignee: 'Affan Khan' }
    });
  });

  test('reports missing task when assigning', () => {
    expect(taskService.assignTask('missing', 'Affan Khan')).toEqual({
      kind: 'not_found'
    });
  });

  test('rejects replacing an existing assignee', () => {
    const task = makeTask({ assignee: 'Existing User' });

    const result = taskService.assignTask(task.id, 'New User');

    expect(result.kind).toBe('already_assigned');
    expect(result.task.assignee).toBe('Existing User');
  });
});
