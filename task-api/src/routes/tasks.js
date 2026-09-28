const express = require('express');
const router = express.Router();

const taskService = require('../services/taskService');
const {
  VALID_STATUSES,
  validateCreateTask,
  validateUpdateTask,
  validateAssignTask,
  validatePagination
} = require('../utils/validators');

router.get('/stats', (req, res) => {
  const stats = taskService.getStats();
  return res.json(stats);
});

router.get('/', (req, res) => {
  const { status, page, limit } = req.query;

  if (status !== undefined) {
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        error: 'status must be one of: ' + VALID_STATUSES.join(', ')
      });
    }

    return res.json(taskService.getByStatus(status));
  }

  if (page !== undefined || limit !== undefined) {
    const paginationError = validatePagination(page, limit);
    if (paginationError) {
      return res.status(400).json({ error: paginationError });
    }

    const pageNum = page === undefined ? 1 : Number(page);
    const limitNum = limit === undefined ? 10 : Number(limit);

    return res.json(taskService.getPaginated(pageNum, limitNum));
  }

  return res.json(taskService.getAll());
});

router.post('/', (req, res) => {
  const error = validateCreateTask(req.body);
  if (error) return res.status(400).json({ error });

  const task = taskService.create(req.body);
  return res.status(201).json(task);
});

router.put('/:id', (req, res) => {
  const error = validateUpdateTask(req.body);
  if (error) return res.status(400).json({ error });

  const task = taskService.update(req.params.id, req.body);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  return res.json(task);
});

router.delete('/:id', (req, res) => {
  const deleted = taskService.remove(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Task not found' });

  return res.status(204).send();
});

router.patch('/:id/complete', (req, res) => {
  const task = taskService.completeTask(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  return res.json(task);
});

router.patch('/:id/assign', (req, res) => {
  const error = validateAssignTask(req.body);
  if (error) return res.status(400).json({ error });

  const result = taskService.assignTask(
    req.params.id,
    req.body.assignee.trim()
  );

  if (result.kind === 'not_found') {
    return res.status(404).json({ error: 'Task not found' });
  }

  if (result.kind === 'already_assigned') {
    return res.status(409).json({ error: 'Task is already assigned' });
  }

  return res.json(result.task);
});

module.exports = router;
