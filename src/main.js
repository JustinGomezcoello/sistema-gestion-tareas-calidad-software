import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { performance } from 'node:perf_hooks';
import { TaskManager } from './taskManager.js';

const manager = new TaskManager();
const rl = readline.createInterface({ input, output });

function printTask(task) {
  if (!task) {
    console.log('\nTarea no encontrada.\n');
    return;
  }

  console.log('\nInformación completa de la tarea:');
  console.log(`ID: ${task.id}`);
  console.log(`Título: ${task.title}`);
  console.log(`Descripción: ${task.description}`);
  console.log(`Prioridad: ${task.priority}`);
  console.log(`Fecha de vencimiento: ${task.dueDate}`);
  console.log(`Estado: ${task.status}\n`);
}

async function createTaskFromTerminal() {
  const id = await rl.question('ID: ');
  const title = await rl.question('Título: ');
  const description = await rl.question('Descripción: ');
  const priority = await rl.question('Prioridad (alta/media/baja): ');
  const dueDate = await rl.question('Fecha de vencimiento (YYYY-MM-DD): ');

  try {
    const task = manager.createTask({ id, title, description, priority, dueDate });
    console.log('\nTarea creada correctamente.');
    printTask(task);
  } catch (error) {
    console.log(`\nError: ${error.message}\n`);
  }
}

async function findTaskFromTerminal() {
  const id = await rl.question('Ingrese el ID de la tarea a buscar: ');
  const start = performance.now();
  const task = manager.findTaskById(id);
  const end = performance.now();

  printTask(task);
  console.log(`Tiempo de respuesta: ${(end - start).toFixed(4)} ms\n`);
}

function loadAutomaticTasks() {
  if (manager.countTasks() >= 50000) {
    console.log('\nLas 50,000 tareas ya fueron cargadas.\n');
    return;
  }

  const start = performance.now();
  manager.loadDemoTasks(50000);
  const end = performance.now();

  console.log(`\nSe cargaron ${manager.countTasks()} tareas automáticamente.`);
  console.log(`Tiempo de carga: ${(end - start).toFixed(2)} ms\n`);
}

async function menu() {
  let option = '';

  while (option !== '4') {
    console.log('===== Sistema de Gestión de Tareas - Sprint 1 =====');
    console.log('1. Crear tarea');
    console.log('2. Buscar tarea por ID');
    console.log('3. Cargar 50,000 tareas automáticamente');
    console.log('4. Salir');

    option = await rl.question('Seleccione una opción: ');

    switch (option.trim()) {
      case '1':
        await createTaskFromTerminal();
        break;
      case '2':
        await findTaskFromTerminal();
        break;
      case '3':
        loadAutomaticTasks();
        break;
      case '4':
        console.log('\nPrograma finalizado.');
        break;
      default:
        console.log('\nOpción inválida. Intente nuevamente.\n');
        break;
    }
  }

  rl.close();
}

menu();
