/**
 * @module main
 * @description Interfaz de usuario por consola (CLI) del Sistema de Gestión de Tareas.
 *
 * Este módulo implementa el menú interactivo que permite al usuario:
 *  1. Crear tareas ingresando datos por teclado.
 *  2. Buscar tareas por ID con búsqueda parcial tipo LIKE.
 *  3. Cargar 50,000 tareas automáticamente para validar escalabilidad.
 *  4. Salir del sistema.
 *
 * Cada operación mide y muestra el tiempo de respuesta usando performance.now(),
 * cumpliendo con el requerimiento no funcional de transparencia en el rendimiento.
 *
 * Tecnología:  JavaScript ES Modules (ESM)
 * Runtime:     Node.js v18+ (usa readline/promises y perf_hooks nativos)
 * Ejecución:   node src/main.js  ó  npm start
 *
 * @author Equipo Sprint 1 - Justin Gomezcoello, David Rueda, Stefan Jativa,
 *         Jhoel Suarez, Mauricio Mora
 * @version 1.0.0
 */

import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { performance } from 'node:perf_hooks';
import { TaskManager } from './taskManager.js';

// Instancia única del gestor de tareas (toda la sesión comparte el mismo almacén)
const manager = new TaskManager();

// Interfaz de lectura para entrada/salida por consola (API de promises de Node.js)
const rl = readline.createInterface({ input, output });

// ─────────────────────────────────────────────────────────────────────────────
// Utilidades de presentación
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Imprime una línea separadora visual en la consola.
 */
function printSeparator() {
  console.log('─'.repeat(60));
}

/**
 * Imprime la información completa de una tarea en formato legible.
 * Si la tarea es null, muestra un mensaje de "Tarea no encontrada".
 *
 * @param {Object|null} task - La tarea a mostrar.
 */
function printTask(task) {
  if (!task) {
    console.log('\n⚠  Tarea no encontrada.\n');
    return;
  }

  console.log('\n📋 Información completa de la tarea:');
  printSeparator();
  console.log(`  ID:            ${task.id}`);
  console.log(`  Título:        ${task.title}`);
  console.log(`  Descripción:   ${task.description}`);
  console.log(`  Prioridad:     ${task.priority}`);
  console.log(`  Fecha venc.:   ${task.dueDate}`);
  printSeparator();
}

/**
 * Imprime el tiempo de respuesta de una operación.
 * Se usa performance.now() que mide con precisión de microsegundos.
 *
 * @param {number} ms - Tiempo en milisegundos.
 */
function printResponseTime(ms) {
  console.log(`⏱  Tiempo de respuesta: ${ms.toFixed(4)} ms\n`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Opción 1: Crear tarea
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Solicita al usuario los datos de una nueva tarea y la crea en el sistema.
 *
 * Flujo:
 *  1. Muestra instrucciones del formato de ID.
 *  2. Solicita cada campo por separado.
 *  3. Intenta crear la tarea con createTask().
 *  4. Si hay error de validación, muestra el mensaje de error al usuario.
 *  5. Siempre muestra el tiempo de respuesta (éxito o error).
 */
async function createTaskFromTerminal() {
  console.log('\n── Crear nueva tarea ──');
  console.log('Nota: El ID debe tener 2 letras seguidas de 3 dígitos (ej: AB123, TK001)\n');

  const id = await rl.question('ID: ');
  const title = await rl.question('Título: ');
  const description = await rl.question('Descripción: ');
  const priority = await rl.question('Prioridad (alta/media/baja): ');
  const dueDate = await rl.question('Fecha de vencimiento (YYYY-MM-DD): ');

  // Medir tiempo de respuesta de la operación de creación
  const start = performance.now();
  try {
    const task = manager.createTask({ id, title, description, priority, dueDate });
    const elapsed = performance.now() - start;
    console.log('\n✅ Tarea creada correctamente.');
    printTask(task);
    printResponseTime(elapsed);
  } catch (error) {
    const elapsed = performance.now() - start;
    console.log(`\n❌ Error: ${error.message}\n`);
    printResponseTime(elapsed);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Opción 2: Buscar tarea por ID (búsqueda parcial tipo LIKE)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Solicita al usuario un texto para buscar tareas por ID parcial (tipo LIKE).
 *
 * Comportamiento LIKE:
 *  - El usuario puede ingresar un ID completo (ej: "TK001") o parcial (ej: "TK").
 *  - La búsqueda encuentra todas las tareas cuyo ID contenga el texto ingresado.
 *  - No es sensible a mayúsculas/minúsculas.
 *
 * Presentación de resultados:
 *  - 0 resultados: mensaje de "No se encontraron tareas".
 *  - 1 resultado: muestra la información completa.
 *  - Múltiples resultados: muestra una tabla resumen (máximo 20 para legibilidad).
 *  - Siempre muestra el tiempo de respuesta.
 */
async function findTaskFromTerminal() {
  console.log('\n── Buscar tarea por ID ──');
  console.log('Nota: La búsqueda es parcial (tipo LIKE). Puede ingresar parte del ID.\n');

  const id = await rl.question('Ingrese el ID (o parte del ID) a buscar: ');

  if (!id || id.trim() === '') {
    console.log('\n⚠  Debe ingresar al menos un carácter para buscar.\n');
    return;
  }

  // Medir tiempo de respuesta de la búsqueda
  const start = performance.now();
  const results = manager.searchTasksById(id);
  const elapsed = performance.now() - start;

  if (results.length === 0) {
    console.log(`\n⚠  No se encontraron tareas que contengan "${id.trim().toUpperCase()}" en su ID.\n`);
  } else if (results.length === 1) {
    console.log(`\n🔍 Se encontró 1 tarea:`);
    printTask(results[0]);
  } else {
    console.log(`\n🔍 Se encontraron ${results.length} tareas que coinciden:`);
    printSeparator();
    // Limitar a 20 resultados para no saturar la consola
    const maxShow = Math.min(results.length, 20);
    for (let i = 0; i < maxShow; i++) {
      const t = results[i];
      console.log(`  ${t.id} | ${t.title} | Prioridad: ${t.priority} | Vence: ${t.dueDate}`);
    }
    if (results.length > 20) {
      console.log(`  ... y ${results.length - 20} resultados más.`);
    }
    printSeparator();
  }

  printResponseTime(elapsed);
}

// ─────────────────────────────────────────────────────────────────────────────
// Opción 3: Cargar 50,000 tareas automáticas
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Carga 50,000 tareas generadas automáticamente para pruebas de rendimiento.
 *
 * Esta función permite validar los requerimientos no funcionales:
 *  - La búsqueda debe responder en menos de 1 segundo con 50,000 tareas.
 *  - El sistema debe ser escalable.
 *
 * Si las tareas ya fueron cargadas previamente, muestra un aviso y no las duplica.
 * Al finalizar, muestra un resumen detallado de la carga y el tiempo que tomó.
 */
function loadAutomaticTasks() {
  console.log('\n── Carga automática de 50,000 tareas ──\n');

  if (manager.countTasks() >= 50000) {
    console.log('⚠  Las 50,000 tareas ya fueron cargadas previamente.');
    console.log(`   Total de tareas en el sistema: ${manager.countTasks()}\n`);
    return;
  }

  console.log('Generando 50,000 tareas con IDs en formato válido (2 letras + 3 dígitos)...');
  console.log('Esto puede tardar unos segundos...\n');

  // Medir tiempo de carga completa
  const start = performance.now();
  manager.loadDemoTasks(50000);
  const elapsed = performance.now() - start;

  console.log(`✅ Se cargaron ${manager.countTasks()} tareas automáticamente.`);
  console.log(`\nDetalle de la generación automática:`);
  printSeparator();
  console.log(`  Cantidad generada:  ${manager.countTasks()} tareas`);
  console.log(`  Formato de IDs:     2 letras + 3 dígitos (AA000 hasta BX999)`);
  console.log(`  Prioridades:        alta, media, baja (distribuidas equitativamente)`);
  console.log(`  Fecha de venc.:     2026-12-31 (fecha uniforme para pruebas)`);
  console.log(`  Estado inicial:     pendiente`);
  printSeparator();
  printResponseTime(elapsed);
}

// ─────────────────────────────────────────────────────────────────────────────
// Funciones Sprint 2
// ─────────────────────────────────────────────────────────────────────────────

async function updateTaskStatusFromTerminal() {
  console.log('\n── Actualizar Estado de Tarea ──');
  const id = await rl.question('Ingrese el ID de la tarea: ');
  const nuevoEstado = await rl.question('Nuevo estado (pendiente/en progreso/completada): ');

  const start = performance.now();
  try {
    const task = manager.actualizarEstadoTarea(id, nuevoEstado);
    const elapsed = performance.now() - start;
    console.log(`\n✅ Estado actualizado correctamente a "${task.status}".`);
    printResponseTime(elapsed);
  } catch (error) {
    const elapsed = performance.now() - start;
    console.log(`\n❌ Error: ${error.message}\n`);
    printResponseTime(elapsed);
  }
}

function listByPriority() {
  console.log('\n── Tareas Agrupadas por Prioridad ──');
  const start = performance.now();
  const agrupadas = manager.listarTareasPorPrioridad();
  const elapsed = performance.now() - start;

  ['alta', 'media', 'baja'].forEach(prioridad => {
    console.log(`\n🔴 Prioridad ${prioridad.toUpperCase()} (${agrupadas[prioridad].length} tareas):`);
    // Mostrar solo las primeras 5 de cada grupo para no saturar consola si hay 50k
    const maxShow = Math.min(agrupadas[prioridad].length, 5);
    for (let i = 0; i < maxShow; i++) {
      const t = agrupadas[prioridad][i];
      console.log(`  - [${t.id}] ${t.title} (Vence: ${t.dueDate}) | Estado: ${t.status}`);
    }
    if (agrupadas[prioridad].length > 5) console.log(`  ... y ${agrupadas[prioridad].length - 5} más.`);
  });
  console.log();
  printResponseTime(elapsed);
}

function listUpcoming() {
  console.log('\n── Tareas Próximas a Vencer (próximos 7 días) ──');
  const start = performance.now();
  const proximas = manager.listarTareasProximasAVencer(7);
  const elapsed = performance.now() - start;

  if (proximas.length === 0) {
    console.log('🎉 ¡Genial! No hay tareas próximas a vencer.');
  } else {
    const maxShow = Math.min(proximas.length, 15);
    for (let i = 0; i < maxShow; i++) {
      const t = proximas[i];
      console.log(`  - [${t.id}] ${t.title} | Prioridad: ${t.priority} | Vence: ${t.dueDate} | Estado: ${t.status}`);
    }
    if (proximas.length > 15) console.log(`  ... y ${proximas.length - 15} más.`);
  }
  console.log();
  printResponseTime(elapsed);
}

// ─────────────────────────────────────────────────────────────────────────────
// Menú principal
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Menú interactivo principal del sistema.
 *
 * Implementa un bucle while que se ejecuta hasta que el usuario seleccione
 * la opción 4 (Salir). Cada opción está delegada a su función correspondiente.
 *
 * Manejo de errores:
 *  - Opción inválida → muestra mensaje de error y vuelve al menú.
 *  - Error en creación → muestra el mensaje de validación específico.
 *  - Búsqueda sin resultados → muestra mensaje informativo.
 */
// Reemplazar la función menu() con esto:
async function menu() {
  let option = '';

  while (option !== '7') { // <-- Cambiar a 7 (o la opción de salida final)
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║   Sistema de Gestión de Tareas Empresarial - Sprint 2    ║');
    console.log('╠══════════════════════════════════════════════════════════╣');
    console.log('║  1. Crear tarea                                          ║');
    console.log('║  2. Buscar tarea por ID                                  ║');
    console.log('║  3. Cargar 50,000 tareas automáticamente                 ║');
    console.log('║  4. Actualizar estado de una tarea                       ║'); // NUEVO
    console.log('║  5. Listar tareas agrupadas por prioridad                ║'); // NUEVO
    console.log('║  6. Listar tareas próximas a vencer                      ║'); // NUEVO
    console.log('║  7. Salir                                                ║');
    console.log('╚══════════════════════════════════════════════════════════╝');

    option = await rl.question('\nSeleccione una opción: ');

    switch (option.trim()) {
      case '1': await createTaskFromTerminal(); break;
      case '2': await findTaskFromTerminal(); break;
      case '3': loadAutomaticTasks(); break;
      case '4': await updateTaskStatusFromTerminal(); break; // NUEVO
      case '5': listByPriority(); break;                     // NUEVO
      case '6': listUpcoming(); break;                       // NUEVO
      case '7': 
        console.log('\n✅ Programa finalizado. ¡Hasta pronto!\n');
        break;
      default:
        console.log('\n❌ Opción inválida. Por favor seleccione una opción del 1 al 7.\n');
        break;
    }
  }
  rl.close();
}

// Iniciar el menú principal
menu();
