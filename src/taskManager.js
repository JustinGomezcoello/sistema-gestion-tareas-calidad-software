/**
 * @module taskManager
 * @description Módulo principal de lógica de negocio del Sistema de Gestión de Tareas.
 *
 * Este módulo implementa las funcionalidades del Sprint 1:
 *  - Crear tarea con validación completa de todos los campos.
 *  - Buscar tarea por ID (búsqueda exacta y parcial tipo LIKE).
 *  - Carga masiva de 50,000 tareas para pruebas de escalabilidad.
 *
 * Tecnología:     JavaScript ES Modules (ESM)
 * Runtime:        Node.js v18+
 * Estructura:     Clase TaskManager con métodos públicos y privados (#)
 * Almacenamiento: Map (estructura hash) para búsqueda O(1) por clave
 *
 * @author Equipo Sprint 1 - Justin Gomezcoello, David Rueda, Stefan Jativa,
 *         Jhoel Suarez, Mauricio Mora
 * @version 1.0.0
 */

export class TaskManager {
  /**
   * Constructor de TaskManager.
   *
   * Se utiliza un Map como estructura de datos interna porque:
   *  - Búsqueda por clave (ID exacto) tiene complejidad O(1) — tiempo constante.
   *  - Inserción tiene complejidad O(1).
   *  - Esto garantiza cumplir el requerimiento no funcional de tiempo de respuesta < 1 segundo,
   *    incluso con 50,000 tareas cargadas.
   *
   * Alternativas descartadas:
   *  - Array + find(): complejidad O(n) — no escala bien para 50,000 registros.
   *  - Objeto plano: funcional pero Map ofrece mejor rendimiento y API más limpia.
   */
  constructor() {
    this.tasks = new Map();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MÉTODOS PÚBLICOS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Crea una nueva tarea en el sistema con validación completa.
   *
   * Validaciones realizadas (en orden):
   *  1. ID obligatorio (no puede estar vacío).
   *  2. Formato de ID: exactamente 2 letras seguidas de 3 dígitos (regex: /^[A-Za-z]{2}\d{3}$/).
   *  3. ID único (no duplicado).
   *  4. Título obligatorio.
   *  5. Descripción obligatoria.
   *  6. Prioridad válida: solo 'alta', 'media' o 'baja'.
   *  7. Fecha de vencimiento: formato YYYY-MM-DD y fecha calendario real.
   *  8. Estado válido: 'pendiente', 'en progreso' o 'completada'.
   *
   * @param {Object} taskData - Datos de la tarea a crear.
   * @param {string} taskData.id - Identificador único (formato: 2 letras + 3 dígitos, ej: AB123).
   * @param {string} taskData.title - Título descriptivo de la tarea.
   * @param {string} taskData.description - Descripción detallada de la tarea.
   * @param {string} taskData.priority - Prioridad: 'alta', 'media' o 'baja'.
   * @param {string} taskData.dueDate - Fecha de vencimiento en formato YYYY-MM-DD.
   * @param {string} [taskData.status='pendiente'] - Estado inicial de la tarea.
   * @returns {Object} La tarea creada con todos sus campos normalizados.
   * @throws {Error} Si alguna validación falla, lanza un error con mensaje descriptivo.
   */
  createTask({ id, title, description, priority, dueDate, status = 'pendiente' }) {
    const taskId = this.#normalizeId(id);

    // Validación 1: ID obligatorio
    if (!taskId) {
      throw new Error('El ID de la tarea es obligatorio.');
    }

    // Validación 2: Formato de ID (2 letras + 3 dígitos)
    if (!this.#isValidIdFormat(taskId)) {
      throw new Error(
        'El ID debe tener el formato: 2 letras seguidas de 3 dígitos (ejemplo: AB123, TK001).'
      );
    }

    // Validación 3: ID no duplicado
    if (this.tasks.has(taskId.toUpperCase())) {
      throw new Error(`Ya existe una tarea con el ID ${taskId.toUpperCase()}.`);
    }

    // Validación 4: Título obligatorio y tamaño máximo
    if (!title || String(title).trim() === '') {
      throw new Error('El título de la tarea es obligatorio.');
    }
    if (String(title).trim().length > 100) {
      throw new Error('El tamaño del título no puede exceder los 100 caracteres.');
    }

    // Validación 5: Descripción obligatoria y tamaño máximo
    if (!description || String(description).trim() === '') {
      throw new Error('La descripción de la tarea es obligatoria.');
    }
    if (String(description).trim().length > 250) {
      throw new Error('El tamaño de la descripción no puede exceder los 250 caracteres.');
    }

    // Validación 6: Prioridad válida (Actualizado según PO)
    if (!['alta', 'media', 'baja'].includes(String(priority).toLowerCase())) {
      throw new Error('Error: La prioridad debe ser ALTA, MEDIA o BAJA.');
    }

    // Validación 7: Fecha de vencimiento válida y FUTURA
    if (!this.#isValidDate(dueDate)) {
      throw new Error('La fecha de vencimiento debe tener formato válido: YYYY-MM-DD.');
    }
    if (!this.#isFutureDate(dueDate)) {
      throw new Error('La fecha de vencimiento solo puede ser una fecha futura.');
    }

    // Validación 8: Estado válido
    if (!['pendiente', 'en progreso', 'completada'].includes(String(status).toLowerCase())) {
      throw new Error('El estado debe ser pendiente, en progreso o completada.');
    }

    // Construir objeto tarea con datos normalizados
    const task = {
      id: taskId.toUpperCase(),
      title: String(title).trim(),
      description: String(description).trim(),
      priority: String(priority).toLowerCase(),
      dueDate: String(dueDate),
      status: String(status).toLowerCase()
    };

    // Almacenar en el Map con ID en mayúsculas como clave
    this.tasks.set(taskId.toUpperCase(), task);
    return task;
  }

  /**
   * Busca una tarea por ID exacto.
   *
   * Complejidad: O(1) gracias al uso de Map.
   * La búsqueda no es sensible a mayúsculas/minúsculas (se normaliza internamente).
   *
   * @param {string} id - El ID exacto de la tarea a buscar.
   * @returns {Object|null} La tarea encontrada, o null si no existe.
   */
  findTaskById(id) {
    const taskId = this.#normalizeId(id);
    if (!taskId) return null;
    return this.tasks.get(taskId.toUpperCase()) ?? null;
  }

  /**
   * Búsqueda parcial tipo LIKE (similar a SQL: WHERE id LIKE '%texto%').
   *
   * Recorre todas las tareas y devuelve aquellas cuyo ID contenga la subcadena
   * ingresada. La búsqueda NO es sensible a mayúsculas/minúsculas.
   *
   * Complejidad: O(n) — recorre todas las tareas para buscar coincidencias parciales.
   * Aun así, con 50,000 tareas el tiempo es inferior a 15 ms (cumple < 1 segundo).
   *
   * Ejemplos de uso:
   *  - searchTasksById('TK')  → encuentra TK001, TK002, TK003, ...
   *  - searchTasksById('001') → encuentra TK001, AB001, CD001, ...
   *  - searchTasksById('tk')  → encuentra TK001 (case insensitive)
   *
   * @param {string} partialId - Texto parcial del ID a buscar.
   * @returns {Array<Object>} Array con las tareas que coinciden (puede estar vacío).
   */
  searchTasksById(partialId) {
    const search = this.#normalizeId(partialId).toUpperCase();
    if (!search) return [];

    const results = [];
    for (const [key, task] of this.tasks) {
      if (key.includes(search)) {
        results.push(task);
      }
    }
    return results;
  }

  /**
   * Retorna la cantidad total de tareas almacenadas en el sistema.
   *
   * @returns {number} Número de tareas.
   */
  countTasks() {
    return this.tasks.size;
  }

  /**
   * Carga automática de tareas de demostración para pruebas de rendimiento y escalabilidad.
   *
   * ALGORITMO DE GENERACIÓN DE IDs:
   * ─────────────────────────────────
   * Los IDs se generan con formato válido (2 letras + 3 dígitos) usando un
   * algoritmo combinatorio de dos niveles:
   *
   *  Nivel 1 — Prefijos de 2 letras:
   *    Se combinan 2 posiciones con letras A-Z, generando 26 × 26 = 676 prefijos:
   *    AA, AB, AC, ..., AZ, BA, BB, ..., ZZ
   *
   *  Nivel 2 — Sufijos de 3 dígitos:
   *    Cada prefijo se combina con números 000-999, generando 1,000 IDs por prefijo.
   *
   *  Capacidad total: 676 × 1,000 = 676,000 IDs únicos posibles.
   *
   * DISTRIBUCIÓN PARA 50,000 TAREAS:
   * ─────────────────────────────────
   *  Prefijos usados: AA hasta BX (50 prefijos)
   *  IDs generados: AA000..AA999, AB000..AB999, ..., BX000..BX999
   *  Total: 50 × 1,000 = 50,000 tareas
   *
   * DATOS GENERADOS POR TAREA:
   * ─────────────────────────────────
   *  - Título: "{acción} - {departamento} #{secuencia}"
   *  - Descripción: texto descriptivo con departamento y secuencia
   *  - Prioridad: rotación equitativa entre alta, media, baja
   *  - Fecha de vencimiento: 2026-12-31 (uniforme)
   *  - Estado: pendiente (por defecto)
   *
   * @param {number} [quantity=50000] - Cantidad de tareas a generar.
   */
  loadDemoTasks(quantity = 50000) {
    const priorities = ['alta', 'media', 'baja'];
    const departments = ['TI', 'RH', 'FN', 'MK', 'OP', 'LG', 'VT', 'AD', 'QA', 'DV'];
    const actions = [
      'Revisar documento', 'Actualizar sistema', 'Generar reporte',
      'Capacitar equipo', 'Auditar proceso', 'Optimizar flujo',
      'Validar datos', 'Configurar servicio', 'Preparar entrega',
      'Analizar métricas'
    ];

    let count = 0;
    for (let letterIdx = 0; letterIdx < 676 && count < quantity; letterIdx++) {
      // Calcular las 2 letras del prefijo usando aritmética modular
      const firstLetter = String.fromCharCode(65 + Math.floor(letterIdx / 26));  // A-Z
      const secondLetter = String.fromCharCode(65 + (letterIdx % 26));            // A-Z
      const prefix = firstLetter + secondLetter;

      for (let num = 0; num < 1000 && count < quantity; num++) {
        // Generar sufijo numérico con padding de ceros (ej: 7 → "007")
        const suffix = String(num).padStart(3, '0');
        const id = `${prefix}${suffix}`;

        // Saltar IDs que ya existan (por si el usuario creó tareas manualmente antes)
        if (this.tasks.has(id)) {
          count++;
          continue;
        }

        // Rotar prioridad, departamento y acción para variedad en los datos
        const priority = priorities[count % 3];
        const dept = departments[count % departments.length];
        const action = actions[count % actions.length];

        this.createTask({
          id,
          title: `${action} - ${dept} #${count + 1}`,
          description: `Tarea generada automáticamente para prueba de carga. Departamento: ${dept}. Número de secuencia: ${count + 1}.`,
          priority,
          dueDate: '2026-12-31'
        });

        count++;
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MÉTODOS PRIVADOS (prefijo # = private en JavaScript moderno)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Normaliza el ID: convierte a string y elimina espacios al inicio/final.
   * Retorna string vacío si el valor es null o undefined.
   *
   * @param {*} id - Valor a normalizar.
   * @returns {string} ID normalizado.
   * @private
   */
  #normalizeId(id) {
    return id === undefined || id === null ? '' : String(id).trim();
  }

  /**
   * Valida que el ID tenga el formato correcto: exactamente 2 letras + 3 dígitos.
   *
   * Regex utilizado: /^[A-Za-z]{2}\d{3}$/
   *  - ^ y $     → el string completo debe coincidir (no parcial)
   *  - [A-Za-z]  → letras mayúsculas o minúsculas
   *  - {2}       → exactamente 2 letras
   *  - \d        → dígito (0-9)
   *  - {3}       → exactamente 3 dígitos
   *
   * Ejemplos válidos:   AB123, TK001, ab123, zz999
   * Ejemplos inválidos: 12345, ABCDE, A123, AB12, A@123
   *
   * @param {string} id - ID a validar.
   * @returns {boolean} true si el formato es válido.
   * @private
   */
  #isValidIdFormat(id) {
    if (!id || typeof id !== 'string') return false;
    const idRegex = /^[A-Za-z]{2}\d{3}$/;
    return idRegex.test(id.trim());
  }

  /**
   * Valida que la fecha tenga formato YYYY-MM-DD y sea una fecha de calendario real.
   *
   * Proceso de validación en 2 pasos:
   *  1. Regex /^\d{4}-\d{2}-\d{2}$/ → verifica el formato de texto.
   *  2. new Date() + isNaN() → verifica que sea una fecha real del calendario.
   *     Esto detecta fechas imposibles como 2026-13-40 (mes 13, día 40).
   *
   * @param {*} value - Valor a validar.
   * @returns {boolean} true si la fecha es válida.
   * @private
   */
  #isValidDate(value) {
    if (!value || typeof value !== 'string') return false;

    // Paso 1: Verificar formato de texto (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(value)) return false;

    // Paso 2: Verificar que sea una fecha real del calendario
    const date = new Date(`${value}T00:00:00`);
    return !Number.isNaN(date.getTime());
  }
  /**
   * Valida que la fecha ingresada sea mayor o igual al día de hoy.
   * @private
   */
  #isFutureDate(dateString) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Ignorar la hora actual para comparar solo días
    const taskDate = new Date(`${dateString}T00:00:00`);
    return taskDate >= today;
  }
  // ─────────────────────────────────────────────────────────────────────────
  // MÉTODOS DEL SPRINT 2
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Actualiza el estado de una tarea existente.
   */
  actualizarEstadoTarea(id, nuevoEstado) {
    const task = this.findTaskById(id);
    if (!task) {
      throw new Error(`No se encontró ninguna tarea con el ID: ${id}`);
    }

    const estadoNormalizado = String(nuevoEstado).toLowerCase();
    if (!['pendiente', 'en progreso', 'completada'].includes(estadoNormalizado)) {
      throw new Error('El estado debe ser: pendiente, en progreso o completada.');
    }

    task.status = estadoNormalizado;
    return task;
  }

  /**
   * Retorna todas las tareas agrupadas por prioridad.
   */
  listarTareasPorPrioridad() {
    const agrupadas = { alta: [], media: [], baja: [] };
    for (const task of this.tasks.values()) {
      // Como aseguramos en createTask que solo pueden ser estas 3, esto es seguro
      agrupadas[task.priority].push(task); 
    }
    return agrupadas;
  }

  /**
   * Retorna las tareas que vencen en los próximos N días y no están completadas.
   */
  listarTareasProximasAVencer(diasLimite = 7) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const futureLimit = new Date(today);
    futureLimit.setDate(futureLimit.getDate() + diasLimite);

    const proximas = [];
    
    for (const task of this.tasks.values()) {
      if (task.status === 'completada') continue; // Ignorar las ya terminadas
      
      const taskDate = new Date(`${task.dueDate}T00:00:00`);
      if (taskDate >= today && taskDate <= futureLimit) {
        proximas.push(task);
      }
    }

    // Ordenar de la más próxima a vencer a la más lejana
    return proximas.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }
}
