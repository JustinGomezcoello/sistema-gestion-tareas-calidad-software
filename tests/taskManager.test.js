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
    priority: 'ALTA',
    dueDate: '2026-05-10'
  });

  assert.equal(task.id, 'AB123');
  assert.equal(task.title, 'Preparar informe');
  assert.equal(task.priority, 'ALTA');
  assert.equal(task.status, 'pendiente');
});

test('no permitir crear una tarea con ID duplicado', () => {
  const manager = new TaskManager();

  manager.createTask({
    id: 'TK001',
    title: 'Tarea inicial',
    description: 'Primera tarea',
    priority: 'MEDIA',
    dueDate: '2026-05-10'
  });

  assert.throws(() => {
    manager.createTask({
      id: 'TK001',
      title: 'Tarea repetida',
      description: 'Segunda tarea con el mismo ID',
      priority: 'BAJA',
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
      priority: 'ALTA',
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
      priority: 'ALTA',
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
      priority: 'MEDIA',
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
      priority: 'BAJA',
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
      priority: 'ALTA',
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
      priority: 'ALTA',
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
    priority: 'MEDIA',
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
      priority: 'ALTA',
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
      priority: 'MEDIA',
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
      priority: 'BAJA',
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
      priority: 'ALTA',
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
    priority: 'MEDIA',
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
      priority: 'ALTA',
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
      priority: 'ALTA',
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
  }, /La prioridad debe ser ALTA, MEDIA o BAJA/);
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
    priority: 'ALTA',
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

  manager.createTask({ id: 'TK001', title: 'Tarea 1', description: 'Desc 1', priority: 'ALTA', dueDate: '2026-05-10' });
  manager.createTask({ id: 'TK002', title: 'Tarea 2', description: 'Desc 2', priority: 'MEDIA', dueDate: '2026-05-11' });
  manager.createTask({ id: 'AB001', title: 'Tarea 3', description: 'Desc 3', priority: 'BAJA', dueDate: '2026-05-12' });

  const results = manager.searchTasksById('TK');
  assert.equal(results.length, 2);
});

test('búsqueda parcial LIKE: encontrar por sufijo numérico', () => {
  const manager = new TaskManager();

  manager.createTask({ id: 'TK001', title: 'Tarea 1', description: 'Desc 1', priority: 'ALTA', dueDate: '2026-05-10' });
  manager.createTask({ id: 'AB001', title: 'Tarea 2', description: 'Desc 2', priority: 'MEDIA', dueDate: '2026-05-11' });
  manager.createTask({ id: 'CD002', title: 'Tarea 3', description: 'Desc 3', priority: 'BAJA', dueDate: '2026-05-12' });

  const results = manager.searchTasksById('001');
  assert.equal(results.length, 2);
});

test('búsqueda parcial LIKE: no encontrar ninguna coincidencia', () => {
  const manager = new TaskManager();

  manager.createTask({ id: 'TK001', title: 'Tarea 1', description: 'Desc 1', priority: 'ALTA', dueDate: '2026-05-10' });

  const results = manager.searchTasksById('ZZ');
  assert.equal(results.length, 0);
});

test('búsqueda parcial LIKE: no sensible a mayúsculas/minúsculas', () => {
  const manager = new TaskManager();

  manager.createTask({ id: 'TK001', title: 'Tarea 1', description: 'Desc 1', priority: 'ALTA', dueDate: '2026-05-10' });

  const results = manager.searchTasksById('tk');
  assert.equal(results.length, 1);
  assert.equal(results[0].id, 'TK001');
});


// ═══════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════
// PRUEBAS DE SPRINT 2: NUEVAS VALIDACIONES DEL PRODUCT OWNER
// ═══════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════
test('rechazar fecha de vencimiento en el pasado', () => {
  const manager = new TaskManager();

  assert.throws(() => {
    manager.createTask({
      id: 'TK050',
      title: 'Tarea con fecha pasada',
      description: 'Esta fecha ya ocurrió',
      priority: 'ALTA',
      dueDate: '2020-01-01'
    });
  }, /La fecha de vencimiento solo puede ser una fecha futura/);
});

test('rechazar prioridad en minúsculas (debe ser estricto en MAYÚSCULAS)', () => {
  const manager = new TaskManager();

  assert.throws(() => {
    manager.createTask({
      id: 'TK051',
      title: 'Tarea minúsculas',
      description: 'Probando prioridad',
      priority: 'alta', // en minúscula
      dueDate: '2026-12-31'
    });
  }, /La prioridad debe ser ingresada en mayúsculas/);
});

test('rechazar título que exceda los 100 caracteres', () => {
  const manager = new TaskManager();
  const tituloLargo = 'A'.repeat(101); // Crea un string de 101 caracteres

  assert.throws(() => {
    manager.createTask({
      id: 'TK052',
      title: tituloLargo,
      description: 'Descripción normal',
      priority: 'MEDIA',
      dueDate: '2026-12-31'
    });
  }, /El tamaño del título no puede exceder los 100 caracteres/);
});

test('rechazar descripción que exceda los 250 caracteres', () => {
  const manager = new TaskManager();
  const descLarga = 'B'.repeat(251); // Crea un string de 251 caracteres

  assert.throws(() => {
    manager.createTask({
      id: 'TK053',
      title: 'Título normal',
      description: descLarga,
      priority: 'BAJA',
      dueDate: '2026-12-31'
    });
  }, /El tamaño de la descripción no puede exceder los 250 caracteres/);
});

// ═══════════════════════════════════════════════════════════════════════════
// PRUEBAS DE SPRINT 2: ACTUALIZAR ESTADO DE TAREA
// ═══════════════════════════════════════════════════════════════════════════

test('actualizar estado de una tarea correctamente', () => {
  const manager = new TaskManager();
  manager.createTask({
    id: 'SP201',
    title: 'Tarea de estado',
    description: 'Prueba cambiar estado',
    priority: 'ALTA',
    dueDate: '2026-12-31'
  });

  const updatedTask = manager.actualizarEstadoTarea('SP201', 'en progreso');
  assert.equal(updatedTask.status, 'en progreso');

  const finalTask = manager.actualizarEstadoTarea('SP201', 'completada');
  assert.equal(finalTask.status, 'completada');
});

test('rechazar actualización a un estado inválido', () => {
  const manager = new TaskManager();
  manager.createTask({
    id: 'SP202',
    title: 'Tarea inválida',
    description: 'Prueba cambiar estado error',
    priority: 'MEDIA',
    dueDate: '2026-12-31'
  });

  assert.throws(() => {
    manager.actualizarEstadoTarea('SP202', 'en pausa'); // Estado no permitido
  }, /El estado debe ser: pendiente, en progreso o completada/);
});

test('rechazar actualización de estado de una tarea que no existe', () => {
  const manager = new TaskManager();
  assert.throws(() => {
    manager.actualizarEstadoTarea('ZZ999', 'en progreso');
  }, /No se encontró ninguna tarea con el ID/);
});

// ═══════════════════════════════════════════════════════════════════════════
// PRUEBAS DE SPRINT 2: LISTAR POR PRIORIDAD
// ═══════════════════════════════════════════════════════════════════════════

test('listar tareas agrupadas correctamente por prioridad', () => {
  const manager = new TaskManager();
  
  // 2 ALTA, 1 MEDIA, 0 BAJA
  manager.createTask({ id: 'PR001', title: 'T1', description: 'D', priority: 'ALTA', dueDate: '2026-12-31' });
  manager.createTask({ id: 'PR002', title: 'T2', description: 'D', priority: 'ALTA', dueDate: '2026-12-31' });
  manager.createTask({ id: 'PR003', title: 'T3', description: 'D', priority: 'MEDIA', dueDate: '2026-12-31' });

  const agrupadas = manager.listarTareasPorPrioridad();

  assert.equal(agrupadas['ALTA'].length, 2);
  assert.equal(agrupadas['MEDIA'].length, 1);
  assert.equal(agrupadas['BAJA'].length, 0);
  assert.equal(agrupadas['ALTA'][0].id, 'PR001');
});

// ═══════════════════════════════════════════════════════════════════════════
// PRUEBAS DE SPRINT 2: PRÓXIMAS A VENCER
// ═══════════════════════════════════════════════════════════════════════════

test('listar tareas próximas a vencer (excluyendo completadas y fuera de rango)', () => {
  const manager = new TaskManager();
  
  // Utilidades para calcular fechas dinámicas para la prueba
  const today = new Date();
  const formatYMD = (date) => date.toISOString().split('T')[0];

  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  const in5Days = new Date(today); in5Days.setDate(today.getDate() + 5);
  const in10Days = new Date(today); in10Days.setDate(today.getDate() + 10);

  // 1. Tarea que vence mañana (DEBE APARECER)
  manager.createTask({ id: 'VN001', title: 'Mañana', description: 'D', priority: 'ALTA', dueDate: formatYMD(tomorrow) });
  
  // 2. Tarea que vence en 5 días (DEBE APARECER)
  manager.createTask({ id: 'VN002', title: 'En 5 días', description: 'D', priority: 'MEDIA', dueDate: formatYMD(in5Days) });
  
  // 3. Tarea que vence en 10 días (NO DEBE APARECER, por defecto el límite es 7 días)
  manager.createTask({ id: 'VN003', title: 'En 10 días', description: 'D', priority: 'BAJA', dueDate: formatYMD(in10Days) });
  
  // 4. Tarea que vence mañana pero está COMPLETADA (NO DEBE APARECER)
  manager.createTask({ id: 'VN004', title: 'Mañana lista', description: 'D', priority: 'ALTA', dueDate: formatYMD(tomorrow) });
  manager.actualizarEstadoTarea('VN004', 'completada');

  const proximas = manager.listarTareasProximasAVencer(7);

  // Solo VN001 y VN002 deberían estar en la lista
  assert.equal(proximas.length, 2, 'Debe retornar exactamente 2 tareas');
  assert.equal(proximas[0].id, 'VN001', 'Debe estar ordenada con la más próxima primero');
  assert.equal(proximas[1].id, 'VN002');
});