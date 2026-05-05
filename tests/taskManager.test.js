import test from 'node:test';
import assert from 'node:assert/strict';
import { TaskManager } from '../src/taskManager.js';

// ═══════════════════════════════════════════════════════════════════════════
// PRUEBAS DE CREACIÓN DE TAREA
// ═══════════════════════════════════════════════════════════════════════════

test('crear una tarea con datos válidos', () => {
  const manager = new TaskManager();

  const task = manager.createTask({
    id: 'AB123',
    title: 'Preparar informe',
    description: 'Realizar informe del Sprint 1',
    priority: 'alta',
    dueDate: '2026-05-10'
  });

  assert.equal(task.id, 'AB123');
  assert.equal(task.title, 'Preparar informe');
  assert.equal(task.priority, 'alta');
  assert.equal(task.status, 'pendiente');
});

test('no permitir crear una tarea con ID duplicado', () => {
  const manager = new TaskManager();

  manager.createTask({
    id: 'TK001',
    title: 'Tarea inicial',
    description: 'Primera tarea',
    priority: 'media',
    dueDate: '2026-05-10'
  });

  assert.throws(() => {
    manager.createTask({
      id: 'TK001',
      title: 'Tarea repetida',
      description: 'Segunda tarea con el mismo ID',
      priority: 'baja',
      dueDate: '2026-05-11'
    });
  }, /Ya existe una tarea/);
});

// ═══════════════════════════════════════════════════════════════════════════
// PRUEBAS DE VALIDACIÓN DE ID (formato: 2 letras + 3 dígitos)
// ═══════════════════════════════════════════════════════════════════════════

test('rechazar ID con formato inválido: solo números', () => {
  const manager = new TaskManager();

  assert.throws(() => {
    manager.createTask({
      id: '12345',
      title: 'Tarea con ID numérico',
      description: 'ID inválido solo números',
      priority: 'alta',
      dueDate: '2026-05-10'
    });
  }, /El ID debe tener el formato: 2 letras seguidas de 3 dígitos/);
});

test('rechazar ID con formato inválido: solo letras', () => {
  const manager = new TaskManager();

  assert.throws(() => {
    manager.createTask({
      id: 'ABCDE',
      title: 'Tarea con ID de puras letras',
      description: 'ID inválido solo letras',
      priority: 'alta',
      dueDate: '2026-05-10'
    });
  }, /El ID debe tener el formato: 2 letras seguidas de 3 dígitos/);
});

test('rechazar ID con formato inválido: 1 letra y 3 dígitos', () => {
  const manager = new TaskManager();

  assert.throws(() => {
    manager.createTask({
      id: 'A123',
      title: 'Tarea con ID corto',
      description: 'Solo 1 letra en lugar de 2',
      priority: 'media',
      dueDate: '2026-05-10'
    });
  }, /El ID debe tener el formato: 2 letras seguidas de 3 dígitos/);
});

test('rechazar ID con formato inválido: 2 letras y 2 dígitos', () => {
  const manager = new TaskManager();

  assert.throws(() => {
    manager.createTask({
      id: 'AB12',
      title: 'Tarea con ID incompleto',
      description: 'Solo 2 dígitos en lugar de 3',
      priority: 'baja',
      dueDate: '2026-05-10'
    });
  }, /El ID debe tener el formato: 2 letras seguidas de 3 dígitos/);
});

test('rechazar ID con formato inválido: caracteres especiales', () => {
  const manager = new TaskManager();

  assert.throws(() => {
    manager.createTask({
      id: 'A@123',
      title: 'Tarea con ID con caracteres especiales',
      description: 'ID tiene símbolo @',
      priority: 'alta',
      dueDate: '2026-05-10'
    });
  }, /El ID debe tener el formato: 2 letras seguidas de 3 dígitos/);
});

test('rechazar ID vacío', () => {
  const manager = new TaskManager();

  assert.throws(() => {
    manager.createTask({
      id: '',
      title: 'Tarea sin ID',
      description: 'ID vacío',
      priority: 'alta',
      dueDate: '2026-05-10'
    });
  }, /El ID de la tarea es obligatorio/);
});

test('aceptar ID válido con letras minúsculas (se convierte a mayúsculas)', () => {
  const manager = new TaskManager();

  const task = manager.createTask({
    id: 'ab123',
    title: 'Tarea con ID minúscula',
    description: 'El ID se normaliza a mayúsculas',
    priority: 'media',
    dueDate: '2026-05-10'
  });

  assert.equal(task.id, 'AB123');
});

// ═══════════════════════════════════════════════════════════════════════════
// PRUEBAS DE VALIDACIÓN DE FECHA
// ═══════════════════════════════════════════════════════════════════════════

test('rechazar fecha con formato inválido: texto libre', () => {
  const manager = new TaskManager();

  assert.throws(() => {
    manager.createTask({
      id: 'TK010',
      title: 'Tarea con fecha inválida',
      description: 'Fecha como texto libre',
      priority: 'alta',
      dueDate: 'mañana'
    });
  }, /La fecha de vencimiento debe tener formato válido: YYYY-MM-DD/);
});

test('rechazar fecha con formato inválido: DD/MM/YYYY', () => {
  const manager = new TaskManager();

  assert.throws(() => {
    manager.createTask({
      id: 'TK011',
      title: 'Tarea con fecha formato incorrecto',
      description: 'Fecha en formato DD/MM/YYYY en lugar de YYYY-MM-DD',
      priority: 'media',
      dueDate: '10/05/2026'
    });
  }, /La fecha de vencimiento debe tener formato válido: YYYY-MM-DD/);
});

test('rechazar fecha con formato inválido: fecha imposible 2026-13-40', () => {
  const manager = new TaskManager();

  assert.throws(() => {
    manager.createTask({
      id: 'TK012',
      title: 'Tarea con fecha imposible',
      description: 'Mes 13 y día 40 no existen',
      priority: 'baja',
      dueDate: '2026-13-40'
    });
  }, /La fecha de vencimiento debe tener formato válido: YYYY-MM-DD/);
});

test('rechazar fecha vacía', () => {
  const manager = new TaskManager();

  assert.throws(() => {
    manager.createTask({
      id: 'TK013',
      title: 'Tarea sin fecha',
      description: 'Fecha no proporcionada',
      priority: 'alta',
      dueDate: ''
    });
  }, /La fecha de vencimiento debe tener formato válido: YYYY-MM-DD/);
});

test('aceptar fecha válida: 2026-02-28', () => {
  const manager = new TaskManager();

  const task = manager.createTask({
    id: 'TK014',
    title: 'Tarea con fecha válida',
    description: 'Febrero 28 es válido',
    priority: 'media',
    dueDate: '2026-02-28'
  });

  assert.equal(task.dueDate, '2026-02-28');
});

// ═══════════════════════════════════════════════════════════════════════════
// PRUEBAS DE VALIDACIÓN DE CAMPOS OBLIGATORIOS
// ═══════════════════════════════════════════════════════════════════════════

test('rechazar tarea sin título', () => {
  const manager = new TaskManager();

  assert.throws(() => {
    manager.createTask({
      id: 'TK020',
      title: '',
      description: 'Tarea sin título',
      priority: 'alta',
      dueDate: '2026-05-10'
    });
  }, /El título de la tarea es obligatorio/);
});

test('rechazar tarea sin descripción', () => {
  const manager = new TaskManager();

  assert.throws(() => {
    manager.createTask({
      id: 'TK021',
      title: 'Tarea con título',
      description: '',
      priority: 'alta',
      dueDate: '2026-05-10'
    });
  }, /La descripción de la tarea es obligatoria/);
});

test('rechazar prioridad inválida', () => {
  const manager = new TaskManager();

  assert.throws(() => {
    manager.createTask({
      id: 'TK022',
      title: 'Tarea con prioridad errónea',
      description: 'La prioridad urgente no es válida',
      priority: 'urgente',
      dueDate: '2026-05-10'
    });
  }, /La prioridad debe ser alta, media o baja/);
});

// ═══════════════════════════════════════════════════════════════════════════
// PRUEBAS DE BÚSQUEDA POR ID (exacta)
// ═══════════════════════════════════════════════════════════════════════════

test('buscar una tarea existente por ID exacto', () => {
  const manager = new TaskManager();

  manager.createTask({
    id: 'TK100',
    title: 'Revisar código',
    description: 'Aplicar revisión interna del equipo',
    priority: 'alta',
    dueDate: '2026-05-12'
  });

  const task = manager.findTaskById('TK100');
  assert.notEqual(task, null);
  assert.equal(task.title, 'Revisar código');
});

test('devolver null cuando no existe la tarea buscada', () => {
  const manager = new TaskManager();
  const task = manager.findTaskById('ZZ999');
  assert.equal(task, null);
});

// ═══════════════════════════════════════════════════════════════════════════
// PRUEBAS DE BÚSQUEDA PARCIAL (tipo LIKE)
// ═══════════════════════════════════════════════════════════════════════════

test('búsqueda parcial LIKE: encontrar varias tareas por prefijo', () => {
  const manager = new TaskManager();

  manager.createTask({ id: 'TK001', title: 'Tarea 1', description: 'Desc 1', priority: 'alta', dueDate: '2026-05-10' });
  manager.createTask({ id: 'TK002', title: 'Tarea 2', description: 'Desc 2', priority: 'media', dueDate: '2026-05-11' });
  manager.createTask({ id: 'AB001', title: 'Tarea 3', description: 'Desc 3', priority: 'baja', dueDate: '2026-05-12' });

  const results = manager.searchTasksById('TK');
  assert.equal(results.length, 2);
});

test('búsqueda parcial LIKE: encontrar por sufijo numérico', () => {
  const manager = new TaskManager();

  manager.createTask({ id: 'TK001', title: 'Tarea 1', description: 'Desc 1', priority: 'alta', dueDate: '2026-05-10' });
  manager.createTask({ id: 'AB001', title: 'Tarea 2', description: 'Desc 2', priority: 'media', dueDate: '2026-05-11' });
  manager.createTask({ id: 'CD002', title: 'Tarea 3', description: 'Desc 3', priority: 'baja', dueDate: '2026-05-12' });

  const results = manager.searchTasksById('001');
  assert.equal(results.length, 2);
});

test('búsqueda parcial LIKE: no encontrar ninguna coincidencia', () => {
  const manager = new TaskManager();

  manager.createTask({ id: 'TK001', title: 'Tarea 1', description: 'Desc 1', priority: 'alta', dueDate: '2026-05-10' });

  const results = manager.searchTasksById('ZZ');
  assert.equal(results.length, 0);
});

test('búsqueda parcial LIKE: no sensible a mayúsculas/minúsculas', () => {
  const manager = new TaskManager();

  manager.createTask({ id: 'TK001', title: 'Tarea 1', description: 'Desc 1', priority: 'alta', dueDate: '2026-05-10' });

  const results = manager.searchTasksById('tk');
  assert.equal(results.length, 1);
  assert.equal(results[0].id, 'TK001');
});
