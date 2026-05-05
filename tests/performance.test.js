import test from 'node:test';
import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { TaskManager } from '../src/taskManager.js';

test('la búsqueda por ID debe responder en menos de 1 segundo con 50,000 tareas', () => {
  const manager = new TaskManager();
  manager.loadDemoTasks(50000);

  const start = performance.now();
  const task = manager.findTaskById('T-49999');
  const end = performance.now();

  const responseTimeMs = end - start;

  assert.notEqual(task, null);
  assert.equal(task.id, 'T-49999');
  assert.ok(
    responseTimeMs < 1000,
    `La búsqueda tardó ${responseTimeMs.toFixed(4)} ms, debe ser menor a 1000 ms.`
  );
});

test('el sistema debe cargar automáticamente 50,000 tareas', () => {
  const manager = new TaskManager();
  manager.loadDemoTasks(50000);

  assert.equal(manager.countTasks(), 50000);
});
