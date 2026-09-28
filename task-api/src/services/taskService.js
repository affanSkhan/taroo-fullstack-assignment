const { v4: uuidv4 } = require('uuid');

let tasks = [];

const VALID_STATUSES = ['todo', 'in_progress', 'done'];

const getAll = () => [...tasks];

const findById = (id) => tasks.find((task) => task.id === id);

const getByStatus = (status) => tasks.filter((task) => task.status === status);

const getPaginated = (page = 1, limit = 10) => {
  const normalizedPage = Number.isInteger(page) && page > 0 ? page : 1;
  const normalizedLimit = Number.isInteger(limit) && limit > 0 ? limit : 10;
  const offset = (normalizedPage - 1) * normalizedLimit;

  return tasks.slice(offset, offset + normalizedLimit);
};

const getStats = () => {
  const now = new Date();
  const counts = { todo: 0, in_progress: 0, done: 0 };
  let overdue = 0;

  tasks.forEach((task) => {
    if (counts[task.status] !== undefined) {
      counts[task.status]++;
    }

    if (
      task.dueDate &&
      task.status !== 'done' &&
      !Number.isNaN(Date.parse(task.dueDate)) &&
      new Date(task.dueDate) < now
    ) {
      overdue++;
    }
  });

  return { ...counts, overdue };
};

const create = ({
  title,
  description = '',
  status = 'todo',
  priority = 'medium',
  dueDate = null,
  assignee = null
}) => {
  const task = {
    id: uuidv4(),
    title: title.trim(),
    description,
    status,
    priority,
    dueDate,
    assignee,
    completedAt: null,
    createdAt: new Date().toISOString()
  };

  tasks.push(task);
  return task;
};

const update = (id, fields) => {
  const index = tasks.findIndex((task) => task.id === id);
  if (index === -1) return null;

  const updated = { ...tasks[index], ...fields };
  tasks[index] = updated;
  return updated;
};

const remove = (id) => {
  const index = tasks.findIndex((task) => task.id === id);
  if (index === -1) return false;

  tasks.splice(index, 1);
  return true;
};

const completeTask = (id) => {
  const task = findById(id);
  if (!task) return null;

  const updated = {
    ...task,
    status: 'done',
    completedAt: new Date().toISOString()
  };

  const index = tasks.findIndex((item) => item.id === id);
  tasks[index] = updated;
  return updated;
};

const assignTask = (id, assignee) => {
  const index = tasks.findIndex((task) => task.id === id);
  if (index === -1) return { kind: 'not_found' };

  if (tasks[index].assignee) {
    return { kind: 'already_assigned', task: tasks[index] };
  }

  const updated = {
    ...tasks[index],
    assignee
  };

  tasks[index] = updated;
  return { kind: 'assigned', task: updated };
};

const _reset = () => {
  tasks = [];
};

module.exports = {
  VALID_STATUSES,
  getAll,
  findById,
  getByStatus,
  getPaginated,
  getStats,
  create,
  update,
  remove,
  completeTask,
  assignTask,
  _reset
};
