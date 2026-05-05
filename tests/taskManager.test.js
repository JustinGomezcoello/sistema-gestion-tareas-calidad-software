import test from 'node:test';
import assert from 'node:assert/strict';
import { TaskManager } from '../src/taskManager.js';

test('crear una tarea con datos válidos', () => {
  const manager = new TaskManager();

  const task = manager.createTask({
    id: '1',
    title: 'Preparar informe',
    description: 'Realizar informe del Sprint 1',
    priority: 'alta',
    dueDate: '2026-05-10'
  });

  assert.equal(task.id, '1');
  assert.equal(task.title, 'Preparar informe');
  assert.equal(task.priority, 'alta');
  assert.equal(task.status, 'pendiente');
});

test('no permitir crear una tarea con ID duplicado', () => {
  const manager = new TaskManager();

  manager.createTask({
    id: '1',
    title: 'Tarea inicial',
    description: 'Primera tarea',
    priority: 'media',
    dueDate: '2026-05-10'
  });

  assert.throws(() => {
    manager.createTask({
      id: '1',
      title: 'Tarea repetida',
      description: 'Segunda tarea con el mismo ID',
      priority: 'baja',
      dueDate: '2026-05-11'
    });
  }, /Ya existe una tarea/);
});

test('buscar una tarea existente por ID', () => {
  const manager = new TaskManager();

  manager.createTask({
    id: 'T-100',
    title: 'Revisar código',
    description: 'Aplicar revisión interna del equipo',
    priority: 'alta',
    dueDate: '2026-05-12'
  });

  const task = manager.findTaskById('T-100');
  assert.notEqual(task, null);
  assert.equal(task.title, 'Revisar código');
});

test('devolver null cuando no existe la tarea buscada', () => {
  const manager = new TaskManager();
  const task = manager.findTaskById('NO-EXISTE');
  assert.equal(task, null);
});

test('validar campos obligatorios al crear una tarea', () => {
  const manager = new TaskManager();

  assert.throws(() => {
    manager.createTask({
      id: '',
      title: '',
      description: '',
      priority: 'urgente',
      dueDate: 'fecha-mala'
    });
  }, /El ID de la tarea es obligatorio/);
});
