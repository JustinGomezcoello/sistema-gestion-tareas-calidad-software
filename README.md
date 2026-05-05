# Sistema de Gestión de Tareas Empresarial - Sprint 1

## Integrantes
- Justin Gomezcoello
- David Rueda
- Stefan Jativa
- Jhoel Suarez
- Mauricio Mora

## Funcionalidades del Sprint 1
1. **Crear una tarea** con validación completa de todos los campos.
2. **Buscar una tarea por ID** con búsqueda parcial tipo LIKE.
3. **Prueba de tiempo de respuesta** menor a 1 segundo en todas las operaciones.
4. **Carga automática de 50,000 tareas** para validar escalabilidad.

## Formato del ID
El ID de cada tarea debe tener el formato: **2 letras seguidas de 3 dígitos**.

| Válido | Inválido |
|--------|----------|
| `AB123` | `12345` (solo números) |
| `TK001` | `ABCDE` (solo letras) |
| `ab123` (se convierte a `AB123`) | `A123` (1 letra + 3 dígitos) |
| `ZZ999` | `AB12` (2 letras + 2 dígitos) |

## Búsqueda parcial (LIKE)
La búsqueda por ID funciona como un `LIKE` en SQL:
- Si escribes `TK`, encuentra todas las tareas cuyo ID contenga `TK` (ej: `TK001`, `TK002`, ...).
- Si escribes `001`, encuentra todas las tareas cuyo ID contenga `001` (ej: `TK001`, `AB001`).
- La búsqueda **no es sensible a mayúsculas/minúsculas**.

## Requisitos
- Node.js v18+ instalado.
- Visual Studio Code.
- PowerShell.

## Ejecutar el sistema
```powershell
npm start
```

## Ejecutar pruebas unitarias y de rendimiento
```powershell
npm test
```

## Criterios de aceptación Sprint 1
- El sistema debe permitir crear una tarea con ID (2 letras + 3 dígitos), título, descripción, prioridad y fecha de vencimiento.
- El sistema debe validar que el ID tenga el formato correcto (2 letras + 3 dígitos).
- El sistema debe validar que el ID no esté vacío.
- El sistema debe evitar IDs duplicados.
- La prioridad solo puede ser alta, media o baja.
- La fecha de vencimiento debe registrarse en formato válido YYYY-MM-DD.
- El sistema debe permitir buscar una tarea por ID con búsqueda parcial (LIKE).
- Si la tarea existe, debe mostrar la información completa.
- Si la tarea no existe, debe mostrar un mensaje claro de "Tarea no encontrada".
- La búsqueda por ID debe responder en menos de 1 segundo.
- El sistema debe cargar 50,000 tareas automáticamente para validar escalabilidad.

## Medición del tiempo de respuesta
El sistema mide y muestra el tiempo de respuesta **en cada operación del menú**:

- **Crear tarea** (opción 1): Muestra el tiempo que tarda en validar y almacenar la tarea.
- **Buscar tarea** (opción 2): Muestra el tiempo que tarda la búsqueda parcial LIKE.
- **Cargar 50,000 tareas** (opción 3): Muestra el tiempo total de generación y carga.

La medición se realiza usando `performance.now()` de Node.js, que calcula el tiempo en milisegundos con alta precisión. Esto permite comprobar que todas las operaciones son eficientes incluso con 50,000 tareas cargadas.

## Cómo se generan las 50,000 tareas automáticas

El método `loadDemoTasks(50000)` genera tareas con IDs en formato válido (2 letras + 3 dígitos) usando un algoritmo combinatorio:

1. **Prefijos de letras**: Se generan combinaciones de 2 letras de AA hasta ZZ (676 combinaciones posibles: AA, AB, ..., AZ, BA, BB, ..., ZZ).
2. **Sufijos numéricos**: Cada prefijo se combina con números de 000 a 999 (1,000 por prefijo).
3. **Capacidad total**: 676 × 1,000 = 676,000 IDs posibles, más que suficiente para 50,000.
4. **Distribución**: Las primeras 50,000 tareas usan los prefijos AA000 hasta BX999.

**Ejemplo de IDs generados:**
```
AA000, AA001, AA002, ..., AA999  (primeras 1,000 tareas)
AB000, AB001, AB002, ..., AB999  (siguientes 1,000 tareas)
AC000, AC001, ...                (y así sucesivamente)
...
BX000, BX001, ..., BX999        (últimas del lote de 50,000)
```

Cada tarea recibe:
- **Título**: Combinación de una acción (ej: "Revisar documento") y un departamento (ej: "TI", "RH", "QA").
- **Descripción**: Texto descriptivo con número de secuencia.
- **Prioridad**: Distribuida equitativamente entre alta, media y baja.
- **Fecha de vencimiento**: 2026-12-31 (uniforme para pruebas).
- **Estado**: pendiente (valor por defecto).

## Estructura del proyecto
```
sistema-tareas-sprint1/
├── src/
│   ├── main.js          # Menú interactivo de consola
│   └── taskManager.js   # Lógica de negocio (crear, buscar, validar)
├── tests/
│   ├── taskManager.test.js   # 23 pruebas unitarias
│   └── performance.test.js   # 5 pruebas de rendimiento
├── package.json
└── README.md
```

## Pruebas implementadas (28 total)

### Pruebas unitarias (23 pruebas)
| Nº | Prueba | Qué valida |
|----|--------|------------|
| 1 | Crear tarea con datos válidos | Creación correcta con todos los campos |
| 2 | ID duplicado | No permite crear con ID repetido |
| 3 | ID solo números | Rechaza `12345` |
| 4 | ID solo letras | Rechaza `ABCDE` |
| 5 | ID 1 letra + 3 dígitos | Rechaza `A123` |
| 6 | ID 2 letras + 2 dígitos | Rechaza `AB12` |
| 7 | ID caracteres especiales | Rechaza `A@123` |
| 8 | ID vacío | Rechaza string vacío |
| 9 | ID minúsculas | `ab123` se convierte a `AB123` |
| 10 | Fecha texto libre | Rechaza `mañana` |
| 11 | Fecha DD/MM/YYYY | Rechaza `10/05/2026` |
| 12 | Fecha imposible | Rechaza `2026-13-40` |
| 13 | Fecha vacía | Rechaza string vacío |
| 14 | Fecha válida | Acepta `2026-02-28` |
| 15 | Título vacío | Rechaza tarea sin título |
| 16 | Descripción vacía | Rechaza tarea sin descripción |
| 17 | Prioridad inválida | Rechaza `urgente` |
| 18 | Búsqueda exacta existente | Encuentra tarea por ID exacto |
| 19 | Búsqueda exacta inexistente | Retorna null |
| 20 | LIKE por prefijo | Busca `TK` → encuentra `TK001`, `TK002` |
| 21 | LIKE por sufijo | Busca `001` → encuentra `TK001`, `AB001` |
| 22 | LIKE sin resultados | Busca `ZZ` → 0 resultados |
| 23 | LIKE case insensitive | Busca `tk` → encuentra `TK001` |

### Pruebas de rendimiento (5 pruebas)
| Nº | Prueba | Qué valida |
|----|--------|------------|
| 24 | Carga de 50,000 tareas | Genera correctamente los 50,000 registros |
| 25 | Búsqueda exacta < 1s | Busca 1 tarea entre 50,000 en menos de 1 segundo |
| 26 | Búsqueda LIKE < 1s | Búsqueda parcial entre 50,000 en menos de 1 segundo |
| 27 | Creación con 50K cargadas < 1s | Crear 1 tarea con 50,000 existentes en menos de 1 segundo |
| 28 | IDs generados válidos | Todos los IDs auto-generados cumplen formato 2 letras + 3 dígitos |
