# Informe Sprint 1

## Portada

**Proyecto:** Sistema de Gestión de Tareas Empresarial  
**Sprint:** Sprint 1 - Crear y buscar tarea por ID  
**Integrantes:** Justin Gomezcoello, David Ruedo, Stefan Jativa, Jheol Suarez y Mauricio Mora  
**Fecha:** ______________________

---

## 1. Criterios de Aceptación

Funcionalidades desarrolladas: Crear tarea y buscar tarea por ID.

| Nº | Funcionalidad | Criterio de aceptación |
|---|---|---|
| 1 | Crear tarea | El sistema debe permitir crear una tarea con ID (formato: 2 letras + 3 dígitos), título, descripción, prioridad y fecha de vencimiento. |
| 2 | Crear tarea | El sistema debe validar que el ID tenga el formato correcto: exactamente 2 letras seguidas de 3 dígitos (ej: AB123, TK001). |
| 3 | Crear tarea | El sistema debe validar que el ID no esté vacío. |
| 4 | Crear tarea | El sistema debe evitar la creación de tareas con ID duplicado. |
| 5 | Crear tarea | La prioridad solo puede ser alta, media o baja. |
| 6 | Crear tarea | La fecha de vencimiento debe registrarse en formato válido YYYY-MM-DD y representar una fecha real (no permite fechas imposibles como 2026-13-40). |
| 7 | Crear tarea | El título y la descripción son obligatorios y no pueden estar vacíos. |
| 8 | Buscar tarea por ID | El sistema debe permitir buscar tareas mediante búsqueda parcial tipo LIKE (no requiere el ID exacto). |
| 9 | Buscar tarea por ID | Si se encuentran tareas, el sistema debe mostrar la información completa de cada una. |
| 10 | Buscar tarea por ID | Si no se encuentran tareas, el sistema debe mostrar un mensaje claro indicando que no hay coincidencias. |
| 11 | Requerimiento no funcional | La búsqueda por ID debe ejecutarse en menos de 1 segundo con 50,000 tareas cargadas. |
| 12 | Requerimiento no funcional | La creación de una tarea individual debe ejecutarse en menos de 1 segundo con 50,000 tareas cargadas. |
| 13 | Requerimiento no funcional | El sistema debe cargar 50,000 tareas automáticamente para validar escalabilidad. |
| 14 | Requerimiento no funcional | Todas las operaciones del menú deben mostrar el tiempo de respuesta al usuario. |

---

## 2. Resultados de Pruebas Unitarias

Se implementaron **28 pruebas automatizadas** usando el módulo nativo `node:test` de Node.js, divididas en 2 archivos:

### 2.1 Pruebas Unitarias (taskManager.test.js - 23 pruebas)

| Nº | Prueba | Resultado | Observación |
|---|---|---|---|
| 1 | Crear tarea con datos válidos | ✅ Éxito | La tarea se registra correctamente con todos los campos. |
| 2 | Evitar ID duplicado | ✅ Éxito | El sistema muestra un error claro si el ID ya existe. |
| 3 | Rechazar ID solo números (12345) | ✅ Éxito | El sistema valida que el formato sea 2 letras + 3 dígitos. |
| 4 | Rechazar ID solo letras (ABCDE) | ✅ Éxito | El sistema detecta la ausencia de dígitos. |
| 5 | Rechazar ID con 1 letra + 3 dígitos (A123) | ✅ Éxito | El sistema exige exactamente 2 letras. |
| 6 | Rechazar ID con 2 letras + 2 dígitos (AB12) | ✅ Éxito | El sistema exige exactamente 3 dígitos. |
| 7 | Rechazar ID con caracteres especiales (A@123) | ✅ Éxito | El sistema solo acepta letras y dígitos. |
| 8 | Rechazar ID vacío | ✅ Éxito | El sistema indica que el ID es obligatorio. |
| 9 | Aceptar ID con minúsculas (ab123→AB123) | ✅ Éxito | El sistema normaliza a mayúsculas automáticamente. |
| 10 | Rechazar fecha texto libre ("mañana") | ✅ Éxito | El sistema exige formato YYYY-MM-DD. |
| 11 | Rechazar fecha DD/MM/YYYY (10/05/2026) | ✅ Éxito | El sistema rechaza formatos de fecha incorrectos. |
| 12 | Rechazar fecha imposible (2026-13-40) | ✅ Éxito | El sistema valida que la fecha sea real (mes 13 y día 40 no existen). |
| 13 | Rechazar fecha vacía | ✅ Éxito | El sistema indica que la fecha es obligatoria. |
| 14 | Aceptar fecha válida (2026-02-28) | ✅ Éxito | Febrero 28 es una fecha válida. |
| 15 | Rechazar tarea sin título | ✅ Éxito | El sistema indica que el título es obligatorio. |
| 16 | Rechazar tarea sin descripción | ✅ Éxito | El sistema indica que la descripción es obligatoria. |
| 17 | Rechazar prioridad inválida ("urgente") | ✅ Éxito | El sistema solo acepta alta, media o baja. |
| 18 | Buscar tarea existente por ID exacto | ✅ Éxito | Se muestra la información completa de la tarea. |
| 19 | Buscar tarea inexistente (null) | ✅ Éxito | El sistema retorna null y muestra mensaje apropiado. |
| 20 | Búsqueda LIKE por prefijo ("TK") | ✅ Éxito | Encuentra TK001 y TK002 (2 resultados). |
| 21 | Búsqueda LIKE por sufijo ("001") | ✅ Éxito | Encuentra TK001 y AB001 (2 resultados). |
| 22 | Búsqueda LIKE sin coincidencias ("ZZ") | ✅ Éxito | Retorna lista vacía, 0 resultados. |
| 23 | Búsqueda LIKE case insensitive ("tk") | ✅ Éxito | Encuentra TK001 aunque se buscó en minúsculas. |

### 2.2 Pruebas de Rendimiento (performance.test.js - 5 pruebas)

| Nº | Prueba | Resultado | Tiempo medido | Observación |
|---|---|---|---|---|
| 24 | Carga automática de 50,000 tareas | ✅ Éxito | ~121 ms | Se generan 50,000 tareas con IDs válidos en menos de 200 ms. |
| 25 | Búsqueda exacta < 1 segundo (50K tareas) | ✅ Éxito | ~0.14 ms | Buscar BX999 entre 50,000 tareas tarda fracciones de milisegundo. |
| 26 | Búsqueda LIKE < 1 segundo (50K tareas) | ✅ Éxito | ~10 ms | Búsqueda parcial "BX" encuentra 1,000 resultados en 10 ms. |
| 27 | Creación con 50K existentes < 1 segundo | ✅ Éxito | ~0.01 ms | Crear 1 tarea nueva con 50,000 existentes es instantáneo. |
| 28 | IDs generados con formato válido | ✅ Éxito | N/A | Todos los IDs auto-generados cumplen el formato 2 letras + 3 dígitos. |

---

## 3. Medición de Tiempo de Respuesta

El sistema muestra el tiempo de respuesta **en cada operación** del menú interactivo:

| Operación | Cómo se mide | Dónde se muestra |
|---|---|---|
| Crear tarea (opción 1) | `performance.now()` antes y después de `createTask()` | Se imprime debajo de la tarea creada o del error |
| Buscar tarea (opción 2) | `performance.now()` antes y después de `searchTasksById()` | Se imprime debajo de los resultados de búsqueda |
| Cargar 50,000 tareas (opción 3) | `performance.now()` antes y después de `loadDemoTasks()` | Se imprime con el resumen de la carga |

La función `performance.now()` de Node.js mide el tiempo con precisión de microsegundos. Todos los tiempos se reportan en milisegundos con 4 decimales.

---

## 4. Cómo se generan las 50,000 tareas automáticas

El método `loadDemoTasks(50000)` genera tareas con IDs válidos usando un **algoritmo combinatorio**:

### Algoritmo de generación de IDs

1. **Prefijos de 2 letras**: Se generan combinaciones de la A a la Z para ambas posiciones.
   - Primera letra: A-Z (26 opciones)
   - Segunda letra: A-Z (26 opciones)
   - Total de prefijos: 26 × 26 = **676 combinaciones** (AA, AB, AC, ..., AZ, BA, BB, ..., ZZ)

2. **Sufijos de 3 dígitos**: Cada prefijo se combina con números de 000 a 999.
   - Total por prefijo: 1,000 IDs
   - Capacidad máxima: 676 × 1,000 = **676,000 IDs únicos**

3. **Para 50,000 tareas**: Se usan los primeros 50 prefijos (AA a BX), cada uno con 1,000 números.
   - Ejemplo: AA000, AA001, ..., AA999, AB000, AB001, ..., AB999, ..., BX000, ..., BX999

### Datos de cada tarea generada

| Campo | Valor generado |
|---|---|
| ID | Formato 2 letras + 3 dígitos (ej: AA000, AB001, BX999) |
| Título | Combinación de acción + departamento + número (ej: "Revisar documento - TI #1") |
| Descripción | Texto descriptivo con departamento y número de secuencia |
| Prioridad | Distribuida equitativamente: alta, media, baja (33.3% cada una) |
| Fecha de vencimiento | 2026-12-31 (uniforme para pruebas) |
| Estado | pendiente (valor por defecto) |

**Departamentos utilizados:** TI, RH, FN, MK, OP, LG, VT, AD, QA, DV (10 departamentos)  
**Acciones utilizadas:** Revisar documento, Actualizar sistema, Generar reporte, Capacitar equipo, Auditar proceso, Optimizar flujo, Validar datos, Configurar servicio, Preparar entrega, Analizar métricas (10 acciones)

---

## 5. Registro de Revisión de Código

**Observaciones detectadas:**
- El ID originalmente no tenía un formato definido; se estableció el formato 2 letras + 3 dígitos para estandarizar la nomenclatura.
- La búsqueda original era exacta; se cambió a búsqueda parcial tipo LIKE para mayor usabilidad.
- Se identificó código duplicado en `main.js` que fue corregido.
- Se agregaron validaciones exhaustivas para fecha (formato, fecha real) e ID (formato, vacío, caracteres).
- El tiempo de respuesta solo se mostraba en la búsqueda; ahora se muestra en todas las operaciones.
- Los IDs generados automáticamente originalmente no cumplían el formato; ahora todos son válidos.

**Mejoras aplicadas:**
- Validación estricta del formato de ID (regex: 2 letras + 3 dígitos).
- Búsqueda parcial tipo LIKE (no sensible a mayúsculas).
- Tiempo de respuesta visible en cada operación del menú.
- Mensajes de error descriptivos con emojis para mejor UX.
- 28 pruebas automatizadas (23 unitarias + 5 de rendimiento).
- Generación de IDs válidos en la carga automática.
- Normalización de IDs a mayúsculas.
- Menú visual mejorado con bordes y separadores.

---

## 6. Reflexión Final del Sprint

En este sprint aprendimos que la calidad no se revisa solo al final, sino durante todo el desarrollo. La definición de criterios de aceptación ayudó a saber exactamente qué debía cumplir el sistema. También comprendimos la importancia de probar el rendimiento desde el inicio, especialmente cuando existe un requisito de manejar hasta 50,000 tareas.

### Reflexión individual - Justin Gomezcoello

Durante este sprint entendí mejor cómo relacionar Scrum con la calidad de software, ya que no solo se trató de programar, sino de validar que cada funcionalidad cumpla criterios claros. También aprendí que las pruebas automatizadas ayudan a comprobar rápidamente si el sistema funciona correctamente y si cumple el tiempo de respuesta esperado.
