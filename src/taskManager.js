export class TaskManager {
  constructor() {
    // Map permite búsquedas por ID de forma rápida, útil para cumplir el tiempo de respuesta.
    this.tasks = new Map();
  }

  createTask({ id, title, description, priority, dueDate, status = 'pendiente' }) {
    const taskId = this.#normalizeId(id);

    if (!taskId) {
      throw new Error('El ID de la tarea es obligatorio.');
    }

    if (this.tasks.has(taskId)) {
      throw new Error(`Ya existe una tarea con el ID ${taskId}.`);
    }

    if (!title || String(title).trim() === '') {
      throw new Error('El título de la tarea es obligatorio.');
    }

    if (!description || String(description).trim() === '') {
      throw new Error('La descripción de la tarea es obligatoria.');
    }

    if (!['alta', 'media', 'baja'].includes(String(priority).toLowerCase())) {
      throw new Error('La prioridad debe ser alta, media o baja.');
    }

    if (!this.#isValidDate(dueDate)) {
      throw new Error('La fecha de vencimiento debe tener formato válido: YYYY-MM-DD.');
    }

    if (!['pendiente', 'en progreso', 'completada'].includes(String(status).toLowerCase())) {
      throw new Error('El estado debe ser pendiente, en progreso o completada.');
    }

    const task = {
      id: taskId,
      title: String(title).trim(),
      description: String(description).trim(),
      priority: String(priority).toLowerCase(),
      dueDate: String(dueDate),
      status: String(status).toLowerCase()
    };

    this.tasks.set(taskId, task);
    return task;
  }

  findTaskById(id) {
    const taskId = this.#normalizeId(id);
    return this.tasks.get(taskId) ?? null;
  }

  countTasks() {
    return this.tasks.size;
  }

  loadDemoTasks(quantity = 50000) {
    for (let i = 1; i <= quantity; i++) {
      const priority = i % 3 === 0 ? 'alta' : i % 3 === 1 ? 'media' : 'baja';
      this.createTask({
        id: `T-${i}`,
        title: `Tarea automatizada ${i}`,
        description: `Descripción generada automáticamente para prueba de carga ${i}`,
        priority,
        dueDate: '2026-12-31'
      });
    }
  }

  #normalizeId(id) {
    return id === undefined || id === null ? '' : String(id).trim();
  }

  #isValidDate(value) {
    if (!value || typeof value !== 'string') return false;
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(value)) return false;

    const date = new Date(`${value}T00:00:00`);
    return !Number.isNaN(date.getTime());
  }
}
