# Sistema de Gestión de Tareas Empresarial - Sprint 1

## Integrantes
- Justin Gomezcoello
- David Ruedo
- Stefan Jativa
- Jheol Suarez
- Mauricio Mora

## Funcionalidades del Sprint 1
1. Crear una tarea.
2. Buscar una tarea por ID.
3. Prueba de tiempo de respuesta menor a 1 segundo.
4. Carga automática de 50,000 tareas para validar escalabilidad.

## Requisitos
- Node.js instalado.
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
- El sistema debe permitir crear una tarea con ID, título, descripción, prioridad y fecha de vencimiento.
- El sistema debe validar que el ID no esté vacío.
- El sistema debe evitar IDs duplicados.
- El sistema debe permitir buscar una tarea por ID.
- Si la tarea existe, debe mostrar la información completa.
- Si la tarea no existe, debe mostrar un mensaje de tarea no encontrada.
- La búsqueda por ID debe responder en menos de 1 segundo.
- El sistema debe cargar 50,000 tareas automáticamente para validar escalabilidad.
