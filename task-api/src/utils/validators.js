const VALID_STATUSES = ['todo', 'in_progress', 'done'];
const VALID_PRIORITIES = ['low', 'medium', 'high'];

const isNonEmptyString = (value) =>
  typeof value === 'string' && value.trim().length > 0;

const isValidDate = (value) =>
  typeof value === 'string' && !Number.isNaN(Date.parse(value));

const validateCreateTask = (body = {}) => {
  if (!isNonEmptyString(body.title)) {
    return 'title is required and must be a non-empty string';
  }

  if (body.description !== undefined && typeof body.description !== 'string') {
    return 'description must be a string';
  }

  if (body.status !== undefined && !VALID_STATUSES.includes(body.status)) {
    return 'status must be one of: ' + VALID_STATUSES.join(', ');
  }

  if (
    body.priority !== undefined &&
    !VALID_PRIORITIES.includes(body.priority)
  ) {
    return 'priority must be one of: ' + VALID_PRIORITIES.join(', ');
  }

  if (
    body.dueDate !== undefined &&
    body.dueDate !== null &&
    !isValidDate(body.dueDate)
  ) {
    return 'dueDate must be a valid ISO date string';
  }

  if (
    body.assignee !== undefined &&
    body.assignee !== null &&
    !isNonEmptyString(body.assignee)
  ) {
    return 'assignee must be a non-empty string';
  }

  return null;
};

const validateUpdateTask = (body = {}) => {
  if (body.title !== undefined && !isNonEmptyString(body.title)) {
    return 'title must be a non-empty string';
  }

  if (body.description !== undefined && typeof body.description !== 'string') {
    return 'description must be a string';
  }

  if (body.status !== undefined && !VALID_STATUSES.includes(body.status)) {
    return 'status must be one of: ' + VALID_STATUSES.join(', ');
  }

  if (
    body.priority !== undefined &&
    !VALID_PRIORITIES.includes(body.priority)
  ) {
    return 'priority must be one of: ' + VALID_PRIORITIES.join(', ');
  }

  if (
    body.dueDate !== undefined &&
    body.dueDate !== null &&
    !isValidDate(body.dueDate)
  ) {
    return 'dueDate must be a valid ISO date string';
  }

  if (
    body.assignee !== undefined &&
    body.assignee !== null &&
    !isNonEmptyString(body.assignee)
  ) {
    return 'assignee must be a non-empty string';
  }

  return null;
};

const validateAssignTask = (body = {}) => {
  if (!isNonEmptyString(body.assignee)) {
    return 'assignee is required and must be a non-empty string';
  }

  return null;
};

const validatePagination = (page, limit) => {
  if (
    page !== undefined &&
    (!/^\d+$/.test(String(page)) || Number(page) < 1)
  ) {
    return 'page must be a positive integer';
  }

  if (
    limit !== undefined &&
    (!/^\d+$/.test(String(limit)) || Number(limit) < 1)
  ) {
    return 'limit must be a positive integer';
  }

  return null;
};

module.exports = {
  VALID_STATUSES,
  VALID_PRIORITIES,
  validateCreateTask,
  validateUpdateTask,
  validateAssignTask,
  validatePagination
};
