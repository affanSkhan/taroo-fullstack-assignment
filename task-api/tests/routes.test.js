const request = require('supertest');
const app = require('../src/app');
const taskService = require('../src/services/taskService');

describe('Task API', () => {
  beforeEach(() => {
    taskService._reset();
  });

  const createTask = (overrides = {}) =>
    request(app).post('/tasks').send({
      title: 'Test task',
      ...overrides
    });

  test('GET /health returns service status', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  test('GET /tasks returns all tasks', async () => {
    await createTask({ title: 'one' });
    await createTask({ title: 'two' });

    const response = await request(app).get('/tasks');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0].title).toBe('one');
  });

  test('GET /tasks?status=todo filters exact status', async () => {
    await createTask({ title: 'todo', status: 'todo' });
    await createTask({ title: 'done', status: 'done' });

    const response = await request(app).get('/tasks?status=todo');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].status).toBe('todo');
  });

  test('GET /tasks rejects invalid status filters', async () => {
    const response = await request(app).get('/tasks?status=not-real');

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/status must be one of/);
  });

  test('GET /tasks paginates from page 1', async () => {
    await createTask({ title: 'one' });
    await createTask({ title: 'two' });
    await createTask({ title: 'three' });

    const pageOne = await request(app).get('/tasks?page=1&limit=2');
    const pageTwo = await request(app).get('/tasks?page=2&limit=2');

    expect(pageOne.status).toBe(200);
    expect(pageOne.body.map((task) => task.title)).toEqual(['one', 'two']);
    expect(pageTwo.body.map((task) => task.title)).toEqual(['three']);
  });

  test('GET /tasks rejects malformed pagination', async () => {
    const response = await request(app).get('/tasks?page=0&limit=10');

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/page must be/);
  });

  test('POST /tasks creates a task', async () => {
    const response = await createTask({
      title: '  Build tests  ',
      description: 'Testing',
      priority: 'high',
      dueDate: '2030-01-01T00:00:00.000Z'
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual(
      expect.objectContaining({
        title: 'Build tests',
        description: 'Testing',
        status: 'todo',
        priority: 'high',
        dueDate: '2030-01-01T00:00:00.000Z',
        assignee: null,
        completedAt: null
      })
    );
    expect(response.body.id).toEqual(expect.any(String));
  });

  test('POST /tasks rejects invalid payload', async () => {
    const response = await request(app)
      .post('/tasks')
      .send({ title: '   ', priority: 'urgent' });

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/title is required/);
  });

  test('PUT /tasks/:id updates task', async () => {
    const created = await createTask({ title: 'Before' });
    const id = created.body.id;

    const response = await request(app)
      .put('/tasks/' + id)
      .send({ title: 'After', priority: 'high' });

    expect(response.status).toBe(200);
    expect(response.body.title).toBe('After');
    expect(response.body.priority).toBe('high');
  });

  test('PUT /tasks/:id returns 404 for missing task', async () => {
    const response = await request(app)
      .put('/tasks/missing')
      .send({ title: 'After' });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Task not found' });
  });

  test('DELETE /tasks/:id deletes task', async () => {
    const created = await createTask();
    const id = created.body.id;

    const response = await request(app).delete('/tasks/' + id);

    expect(response.status).toBe(204);
    expect(response.body).toEqual({});
  });

  test('DELETE /tasks/:id returns 404 for missing task', async () => {
    const response = await request(app).delete('/tasks/missing');

    expect(response.status).toBe(404);
  });

  test('PATCH /tasks/:id/complete marks task complete and preserves priority', async () => {
    const created = await createTask({
      priority: 'high',
      status: 'in_progress'
    });

    const response = await request(app).patch(
      '/tasks/' + created.body.id + '/complete'
    );

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('done');
    expect(response.body.priority).toBe('high');
    expect(response.body.completedAt).toEqual(expect.any(String));
  });

  test('PATCH /tasks/:id/complete returns 404 for missing task', async () => {
    const response = await request(app).patch('/tasks/missing/complete');

    expect(response.status).toBe(404);
  });

  test('GET /tasks/stats returns counts and overdue count', async () => {
    await createTask({
      title: 'overdue',
      status: 'todo',
      dueDate: new Date(Date.now() - 60_000).toISOString()
    });
    await createTask({ title: 'done', status: 'done' });

    const response = await request(app).get('/tasks/stats');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      todo: 1,
      in_progress: 0,
      done: 1,
      overdue: 1
    });
  });

  test('PATCH /tasks/:id/assign assigns and trims the name', async () => {
    const created = await createTask();

    const response = await request(app)
      .patch('/tasks/' + created.body.id + '/assign')
      .send({ assignee: '  Affan Khan  ' });

    expect(response.status).toBe(200);
    expect(response.body.assignee).toBe('Affan Khan');
  });

  test('PATCH /tasks/:id/assign rejects blank assignee', async () => {
    const created = await createTask();

    const response = await request(app)
      .patch('/tasks/' + created.body.id + '/assign')
      .send({ assignee: '   ' });

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/assignee is required/);
  });

  test('PATCH /tasks/:id/assign returns 404 for missing task', async () => {
    const response = await request(app)
      .patch('/tasks/missing/assign')
      .send({ assignee: 'Affan' });

    expect(response.status).toBe(404);
  });

  test('PATCH /tasks/:id/assign returns 409 when already assigned', async () => {
    const created = await createTask({ assignee: 'Existing' });

    const response = await request(app)
      .patch('/tasks/' + created.body.id + '/assign')
      .send({ assignee: 'New' });

    expect(response.status).toBe(409);
    expect(response.body).toEqual({ error: 'Task is already assigned' });
  });

  test('unknown route returns JSON 404', async () => {
    const response = await request(app).get('/does-not-exist');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Route not found' });
  });
});
