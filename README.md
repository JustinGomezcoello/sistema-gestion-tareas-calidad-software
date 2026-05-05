# Sistema de Gestión de Tareas Empresarial — Sprint 1

## Datos del Proyecto

| Campo | Detalle |
|-------|---------|
| **Materia** | Calidad de Software |
| **Sprint** | Sprint 1 — Crear y Buscar Tarea por ID |
| **Integrantes** | Justin Gomezcoello, David Rueda, Stefan Jativa, Jhoel Suarez, Mauricio Mora |
| **Lenguaje** | JavaScript (ES Modules / ESM) |
| **Runtime** | Node.js v18+ |
| **Framework de pruebas** | `node:test` (módulo nativo de Node.js, sin dependencias externas) |
| **Medición de rendimiento** | `performance.now()` del módulo `node:perf_hooks` |
| **Dependencias externas** | Ninguna — el proyecto usa solo módulos nativos de Node.js |

---

## Funcionalidades del Sprint 1

| Nº | Funcionalidad | Tipo |
|----|---------------|------|
| 1 | Crear tarea con validación completa de todos los campos | Funcional |
| 2 | Buscar tarea por ID con búsqueda parcial tipo LIKE | Funcional |
| 3 | Tiempo de respuesta < 1 segundo en todas las operaciones | No funcional |
| 4 | Carga automática de 50,000 tareas para validar escalabilidad | No funcional |

---

## Cómo Ejecutar el Proyecto

### Requisitos previos
- **Node.js v18 o superior** instalado ([descargar](https://nodejs.org/)).
- **Terminal / PowerShell**.

### Ejecutar el sistema interactivo
```powershell
npm start
```
Esto abre un menú en la terminal con 4 opciones (crear, buscar, cargar 50K, salir).

### Ejecutar todas las pruebas (unitarias + rendimiento)
```powershell
npm test
```
Ejecuta las **28 pruebas automatizadas** y muestra los resultados en consola.

---

## Estructura del Proyecto

```
sistema-tareas-sprint1/
├── src/
│   ├── taskManager.js        ← Lógica de negocio (crear, buscar, validar, cargar)
│   └── main.js               ← Menú interactivo de consola (interfaz de usuario)
├── tests/
│   ├── taskManager.test.js   ← 23 pruebas unitarias
│   └── performance.test.js   ← 5 pruebas de rendimiento y escalabilidad
├── package.json              ← Configuración del proyecto y scripts
├── INFORME_SPRINT1_BORRADOR.md ← Informe del sprint
└── README.md                 ← Este archivo
```

### Separación de responsabilidades

| Archivo | Responsabilidad |
|---------|----------------|
| `taskManager.js` | **Lógica pura de negocio.** No tiene interacción con la consola. Contiene la clase `TaskManager` con métodos para crear, buscar y validar tareas. Es independiente de la interfaz y puede reutilizarse en otro contexto (API web, app móvil, etc.). |
| `main.js` | **Interfaz de usuario (CLI).** Se encarga de leer datos del teclado, mostrar resultados y medir tiempos de respuesta. Importa y usa `TaskManager`. |
| `taskManager.test.js` | **Pruebas unitarias.** Verifica que cada validación y funcionalidad del `TaskManager` funcione correctamente en aislamiento. |
| `performance.test.js` | **Pruebas de rendimiento.** Verifica que las operaciones cumplan el requerimiento de < 1 segundo con 50,000 tareas. |

---

## Tecnologías Utilizadas y Justificación

### JavaScript ES Modules (ESM)
Se usa la sintaxis moderna `import/export` de JavaScript en lugar de `require()`. Esto se configura con `"type": "module"` en `package.json`.

### `Map` como estructura de datos
El almacenamiento de tareas usa un `Map` de JavaScript en lugar de un array o un objeto plano:

| Operación | Map (usado) | Array + find() (descartado) |
|-----------|-------------|----------------------------|
| Buscar por ID exacto | **O(1)** — tiempo constante | O(n) — recorre todo |
| Insertar tarea | **O(1)** | O(1) con push |
| Verificar duplicado | **O(1)** con `has()` | O(n) con `find()` |
| Búsqueda LIKE | O(n) — inevitable | O(n) |

**Conclusión:** Map garantiza que la búsqueda exacta y la creación sean instantáneas sin importar cuántas tareas existan, lo cual es clave para cumplir el requerimiento de < 1 segundo con 50,000 tareas.

### `node:test` para pruebas
Se usa el framework de pruebas **nativo de Node.js** (`node:test`), lo que significa que:
- No se necesita instalar Jest, Mocha ni ninguna dependencia externa.
- Las pruebas se ejecutan directamente con `node --test`.
- Los assertions usan `node:assert/strict` (también nativo).

### `performance.now()` para medir tiempo
Se usa el módulo `node:perf_hooks` que ofrece medición con precisión de **microsegundos**. Esto es más preciso que `Date.now()` que solo tiene precisión de milisegundos.

---

## Formato del ID

El ID de cada tarea debe tener el formato: **2 letras seguidas de 3 dígitos**.

**Regex utilizado:** `/^[A-Za-z]{2}\d{3}$/`

| Componente | Significado |
|------------|-------------|
| `^` y `$` | El string completo debe coincidir (no parcial) |
| `[A-Za-z]` | Una letra (mayúscula o minúscula) |
| `{2}` | Exactamente 2 letras |
| `\d` | Un dígito (0-9) |
| `{3}` | Exactamente 3 dígitos |

### Ejemplos

| Entrada | ¿Válido? | Razón |
|---------|----------|-------|
| `AB123` | ✅ Sí | 2 letras + 3 dígitos |
| `TK001` | ✅ Sí | 2 letras + 3 dígitos |
| `ab123` | ✅ Sí | Se convierte automáticamente a `AB123` |
| `12345` | ❌ No | Solo números, faltan letras |
| `ABCDE` | ❌ No | Solo letras, faltan dígitos |
| `A123` | ❌ No | Solo 1 letra (necesita 2) |
| `AB12` | ❌ No | Solo 2 dígitos (necesita 3) |
| `A@123` | ❌ No | Contiene carácter especial |
| *(vacío)* | ❌ No | ID obligatorio |

---

## Búsqueda Parcial tipo LIKE

La búsqueda por ID funciona como un `LIKE '%texto%'` en SQL. El usuario no necesita escribir el ID completo.

### ¿Cómo funciona internamente?

```javascript
// Método searchTasksById en taskManager.js
searchTasksById(partialId) {
  const search = partialId.toUpperCase();
  const results = [];
  for (const [key, task] of this.tasks) {
    if (key.includes(search)) {   // ← Aquí está el LIKE
      results.push(task);
    }
  }
  return results;
}
```

El método `String.includes()` verifica si el ID de cada tarea **contiene** el texto buscado en cualquier posición, igual que `LIKE '%texto%'` en SQL.

### Ejemplos de búsqueda

| Texto ingresado | Tareas encontradas | Explicación |
|-----------------|-------------------|-------------|
| `TK` | TK001, TK002, TK003, ... | Busca por prefijo |
| `001` | TK001, AB001, CD001, ... | Busca por sufijo numérico |
| `K00` | TK001, TK002, ..., TK009 | Busca por subcadena intermedia |
| `tk` | TK001, TK002, ... | Case insensitive (no sensible a mayúsculas) |
| `ZZZ` | *(ninguna)* | Muestra mensaje "No se encontraron tareas" |

---

## Medición del Tiempo de Respuesta

El sistema mide y muestra el tiempo de respuesta **en cada operación del menú**:

| Operación del menú | Qué se mide | Cómo se mide |
|---------------------|-------------|--------------|
| **1. Crear tarea** | Tiempo de validación + almacenamiento | `performance.now()` antes y después de `createTask()` |
| **2. Buscar tarea** | Tiempo de búsqueda parcial LIKE | `performance.now()` antes y después de `searchTasksById()` |
| **3. Cargar 50,000** | Tiempo total de generación y carga | `performance.now()` antes y después de `loadDemoTasks()` |

### Resultados típicos de rendimiento

| Operación | Tiempo medido | ¿Cumple < 1 segundo? |
|-----------|---------------|----------------------|
| Carga de 50,000 tareas | ~128 ms | ✅ Sí |
| Búsqueda exacta (1 tarea entre 50,000) | ~0.10 ms | ✅ Sí |
| Búsqueda LIKE "BX" (1,000 resultados entre 50,000) | ~11.5 ms | ✅ Sí |
| Creación de 1 tarea con 50,000 existentes | ~0.01 ms | ✅ Sí |

**Nota:** Los tiempos pueden variar según el hardware. Lo importante es que todos están muy por debajo del límite de 1 segundo (1,000 ms).

---

## Cómo se Generan las 50,000 Tareas Automáticas

El método `loadDemoTasks(50000)` en `taskManager.js` genera tareas con IDs válidos usando un **algoritmo combinatorio**.

### Algoritmo paso a paso

**Paso 1 — Generar prefijos de 2 letras:**
- Se combinan 2 posiciones de letras A-Z.
- Primera letra: A-Z (26 opciones). Segunda letra: A-Z (26 opciones).
- Total: 26 × 26 = **676 prefijos** (AA, AB, AC, ..., AZ, BA, BB, ..., ZZ).

**Paso 2 — Combinar con sufijos de 3 dígitos:**
- Cada prefijo se combina con números del 000 al 999.
- Capacidad por prefijo: 1,000 IDs.
- Capacidad total: 676 × 1,000 = **676,000 IDs únicos posibles**.

**Paso 3 — Generar datos representativos:**
- Cada tarea recibe un título combinando una acción (10 opciones) y un departamento (10 opciones).
- La prioridad se distribuye equitativamente: alta, media, baja (33.3% cada una).

### Distribución de IDs para 50,000 tareas

```
Prefijo AA → AA000, AA001, AA002, ..., AA999  (1,000 tareas)
Prefijo AB → AB000, AB001, AB002, ..., AB999  (1,000 tareas)
Prefijo AC → AC000, AC001, AC002, ..., AC999  (1,000 tareas)
  ... (50 prefijos en total) ...
Prefijo BX → BX000, BX001, BX002, ..., BX999  (1,000 tareas)
────────────────────────────────────────────────
Total: 50 prefijos × 1,000 = 50,000 tareas
```

### Datos generados para cada tarea

| Campo | Valor generado | Ejemplo |
|-------|---------------|---------|
| ID | 2 letras + 3 dígitos | AA000, AB001, BX999 |
| Título | "{acción} - {departamento} #{secuencia}" | "Revisar documento - TI #1" |
| Descripción | Texto con departamento y número | "Tarea generada automáticamente..." |
| Prioridad | Rotación: alta → media → baja | alta (tarea 1), media (tarea 2), baja (tarea 3) |
| Fecha de vencimiento | 2026-12-31 (uniforme) | 2026-12-31 |
| Estado | pendiente (por defecto) | pendiente |

**Departamentos:** TI, RH, FN, MK, OP, LG, VT, AD, QA, DV (10 departamentos).
**Acciones:** Revisar documento, Actualizar sistema, Generar reporte, Capacitar equipo, Auditar proceso, Optimizar flujo, Validar datos, Configurar servicio, Preparar entrega, Analizar métricas (10 acciones).

---

## Pruebas Implementadas (28 total)

### Pruebas unitarias — `taskManager.test.js` (23 pruebas)

#### Creación de tarea (2 pruebas)
| Nº | Nombre de la prueba | Qué valida |
|----|---------------------|------------|
| 1 | Crear tarea con datos válidos | La tarea se registra con todos los campos correctos |
| 2 | No permitir ID duplicado | Lanza error si ya existe una tarea con ese ID |

#### Validación de ID (7 pruebas)
| Nº | Nombre de la prueba | Entrada probada | Error esperado |
|----|---------------------|-----------------|----------------|
| 3 | Rechazar ID solo números | `12345` | "El ID debe tener el formato..." |
| 4 | Rechazar ID solo letras | `ABCDE` | "El ID debe tener el formato..." |
| 5 | Rechazar 1 letra + 3 dígitos | `A123` | "El ID debe tener el formato..." |
| 6 | Rechazar 2 letras + 2 dígitos | `AB12` | "El ID debe tener el formato..." |
| 7 | Rechazar caracteres especiales | `A@123` | "El ID debe tener el formato..." |
| 8 | Rechazar ID vacío | `""` | "El ID de la tarea es obligatorio" |
| 9 | Aceptar minúsculas (normalización) | `ab123` → `AB123` | Sin error, se normaliza |

#### Validación de fecha (5 pruebas)
| Nº | Nombre de la prueba | Entrada probada | Error esperado |
|----|---------------------|-----------------|----------------|
| 10 | Rechazar texto libre | `"mañana"` | "La fecha de vencimiento debe tener formato válido..." |
| 11 | Rechazar formato DD/MM/YYYY | `"10/05/2026"` | "La fecha de vencimiento debe tener formato válido..." |
| 12 | Rechazar fecha imposible | `"2026-13-40"` | "La fecha de vencimiento debe tener formato válido..." |
| 13 | Rechazar fecha vacía | `""` | "La fecha de vencimiento debe tener formato válido..." |
| 14 | Aceptar fecha válida | `"2026-02-28"` | Sin error |

#### Validación de campos obligatorios (3 pruebas)
| Nº | Nombre de la prueba | Campo probado | Error esperado |
|----|---------------------|---------------|----------------|
| 15 | Rechazar tarea sin título | título = `""` | "El título de la tarea es obligatorio" |
| 16 | Rechazar tarea sin descripción | descripción = `""` | "La descripción de la tarea es obligatoria" |
| 17 | Rechazar prioridad inválida | prioridad = `"urgente"` | "La prioridad debe ser alta, media o baja" |

#### Búsqueda exacta (2 pruebas)
| Nº | Nombre de la prueba | Qué valida |
|----|---------------------|------------|
| 18 | Buscar tarea existente | Retorna la tarea con información completa |
| 19 | Buscar tarea inexistente | Retorna `null` |

#### Búsqueda parcial LIKE (4 pruebas)
| Nº | Nombre de la prueba | Búsqueda | Resultado esperado |
|----|---------------------|----------|-------------------|
| 20 | LIKE por prefijo | `"TK"` | Encuentra TK001, TK002 (2 resultados) |
| 21 | LIKE por sufijo | `"001"` | Encuentra TK001, AB001 (2 resultados) |
| 22 | LIKE sin coincidencias | `"ZZ"` | 0 resultados |
| 23 | LIKE case insensitive | `"tk"` | Encuentra TK001 (1 resultado) |

### Pruebas de rendimiento — `performance.test.js` (5 pruebas)

| Nº | Nombre de la prueba | Qué mide | Criterio |
|----|---------------------|----------|----------|
| 24 | Carga de 50,000 tareas | Tiempo de generación masiva | Genera exactamente 50,000 |
| 25 | Búsqueda exacta < 1s | Buscar BX999 entre 50,000 | < 1,000 ms |
| 26 | Búsqueda LIKE < 1s | Buscar "BX" entre 50,000 | < 1,000 ms |
| 27 | Creación con 50K < 1s | Crear 1 tarea con 50,000 existentes | < 1,000 ms |
| 28 | IDs generados válidos | Verificar formato de IDs auto-generados | 100% formato correcto |

---

## Criterios de Aceptación del Sprint 1

| Nº | Criterio | Tipo | ¿Cumple? | Evidencia |
|----|----------|------|----------|-----------|
| 1 | Crear tarea con ID, título, descripción, prioridad y fecha | Funcional | ✅ | Prueba #1 |
| 2 | Validar formato de ID (2 letras + 3 dígitos) | Funcional | ✅ | Pruebas #3-#9 |
| 3 | Validar ID no vacío | Funcional | ✅ | Prueba #8 |
| 4 | Evitar IDs duplicados | Funcional | ✅ | Prueba #2 |
| 5 | Prioridad solo alta, media o baja | Funcional | ✅ | Prueba #17 |
| 6 | Fecha con formato YYYY-MM-DD válido | Funcional | ✅ | Pruebas #10-#14 |
| 7 | Título y descripción obligatorios | Funcional | ✅ | Pruebas #15-#16 |
| 8 | Buscar tareas con búsqueda parcial LIKE | Funcional | ✅ | Pruebas #20-#23 |
| 9 | Mostrar información completa si la tarea existe | Funcional | ✅ | Prueba #18 |
| 10 | Mostrar mensaje si la tarea no existe | Funcional | ✅ | Prueba #19 |
| 11 | Búsqueda < 1 segundo con 50,000 tareas | No funcional | ✅ | Pruebas #25-#26 |
| 12 | Creación < 1 segundo con 50,000 tareas | No funcional | ✅ | Prueba #27 |
| 13 | Cargar 50,000 tareas automáticamente | No funcional | ✅ | Prueba #24 |
| 14 | Mostrar tiempo de respuesta en cada operación | No funcional | ✅ | Visible en menú |

---

## Manejo de Errores

Todos los errores de validación se muestran al usuario con mensajes claros en español:

| Situación | Mensaje mostrado al usuario |
|-----------|----------------------------|
| ID vacío | "El ID de la tarea es obligatorio." |
| ID con formato incorrecto | "El ID debe tener el formato: 2 letras seguidas de 3 dígitos (ejemplo: AB123, TK001)." |
| ID duplicado | "Ya existe una tarea con el ID AB123." |
| Título vacío | "El título de la tarea es obligatorio." |
| Descripción vacía | "La descripción de la tarea es obligatoria." |
| Prioridad inválida | "La prioridad debe ser alta, media o baja." |
| Fecha inválida | "La fecha de vencimiento debe tener formato válido: YYYY-MM-DD (ejemplo: 2026-05-10)." |
| Búsqueda sin resultados | "No se encontraron tareas que contengan 'XYZ' en su ID." |
| Opción de menú inválida | "Opción inválida. Por favor seleccione una opción del 1 al 4." |
| 50,000 ya cargadas | "Las 50,000 tareas ya fueron cargadas previamente." |

---

## Relación con Calidad de Software y Scrum

### Definición de "Hecho" (Definition of Done)
Una funcionalidad se considera terminada cuando:
1. El código compila y ejecuta sin errores.
2. Todas las pruebas unitarias pasan.
3. Las pruebas de rendimiento cumplen el criterio de < 1 segundo.
4. Los mensajes de error son claros y en español.
5. El código está documentado con JSDoc.

### Pruebas continuas
- **23 pruebas unitarias** validan cada regla de negocio individualmente.
- **5 pruebas de rendimiento** verifican la escalabilidad del sistema.
- Las pruebas se ejecutan con un solo comando: `npm test`.

### Revisión de código
- Se corrigió código duplicado en `main.js`.
- Se mejoró la estructura separando lógica de negocio (taskManager.js) de la interfaz (main.js).
- Se documentaron todos los métodos con JSDoc.
- Se usan métodos privados (`#método`) de JavaScript moderno para encapsulación.
