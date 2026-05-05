import test from 'node:test';
import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { TaskManager } from '../src/taskManager.js';

// ═══════════════════════════════════════════════════════════════════════════
// PRUEBAS DE RENDIMIENTO Y ESCALABILIDAD
// ═══════════════════════════════════════════════════════════════════════════

test('el sistema debe cargar automáticamente 50,000 tareas', () => {
  const manager = new TaskManager();

  const start = performance.now();
  manager.loadDemoTasks(50000);
  const elapsed = performance.now() - start;

  assert.equal(manager.countTasks(), 50000);
  console.log(`    Tiempo de carga de 50,000 tareas: ${elapsed.toFixed(2)} ms`);
});

test('la búsqueda exacta por ID debe responder en menos de 1 segundo con 50,000 tareas', () => {
  const manager = new TaskManager();
  manager.loadDemoTasks(50000);

  // Buscar una tarea cercana al final: prefijo BX, número 049
  // Con 50,000 tareas: AA000-AA999 (1000), AB000-AB999 (1000), ...
  // Tarea 49,999 → letterIdx = floor(49999/1000) = 49 → first = floor(49/26)=1='B', second=49%26=23='X' → BX
  // num = 49999 % 1000 = 999 → BX999
  const start = performance.now();
  const task = manager.findTaskById('BX999');
  const elapsed = performance.now() - start;

  assert.notEqual(task, null, 'La tarea BX999 debe existir entre las 50,000 tareas generadas');
  assert.equal(task.id, 'BX999');
  assert.ok(
    elapsed < 1000,
    `La búsqueda exacta tardó ${elapsed.toFixed(4)} ms, debe ser menor a 1000 ms.`
  );

  console.log(`    Búsqueda exacta de BX999: ${elapsed.toFixed(4)} ms`);
});

test('la búsqueda parcial LIKE debe responder en menos de 1 segundo con 50,000 tareas', () => {
  const manager = new TaskManager();
  manager.loadDemoTasks(50000);

  const start = performance.now();
  const results = manager.searchTasksById('BX');
  const elapsed = performance.now() - start;

  assert.ok(results.length > 0, 'La búsqueda LIKE de "BX" debe encontrar resultados');
  assert.ok(
    elapsed < 1000,
    `La búsqueda LIKE tardó ${elapsed.toFixed(4)} ms, debe ser menor a 1000 ms.`
  );

  console.log(`    Búsqueda LIKE de "BX": ${results.length} resultados en ${elapsed.toFixed(4)} ms`);
});

test('la creación de una tarea individual debe responder en menos de 1 segundo con 50,000 tareas cargadas', () => {
  const manager = new TaskManager();
  manager.loadDemoTasks(50000);

  const start = performance.now();
  const task = manager.createTask({
    id: 'ZZ999',
    title: 'Tarea de prueba de rendimiento',
    description: 'Verificar que la creación es rápida con 50,000 tareas',
    priority: 'alta',
    dueDate: '2026-12-31'
  });
  const elapsed = performance.now() - start;

  assert.notEqual(task, null);
  assert.ok(
    elapsed < 1000,
    `La creación tardó ${elapsed.toFixed(4)} ms, debe ser menor a 1000 ms.`
  );

  console.log(`    Creación de tarea con 50,000 existentes: ${elapsed.toFixed(4)} ms`);
});

test('todas las tareas generadas automáticamente tienen IDs con formato válido (2 letras + 3 dígitos)', () => {
  const manager = new TaskManager();
  manager.loadDemoTasks(100); // Solo 100 para verificar el formato rápidamente

  const idRegex = /^[A-Z]{2}\d{3}$/;
  let invalidCount = 0;

  for (const [key] of manager.tasks) {
    if (!idRegex.test(key)) {
      invalidCount++;
    }
  }

  assert.equal(
    invalidCount, 0,
    `Se encontraron ${invalidCount} IDs con formato inválido entre las tareas generadas`
  );
});
