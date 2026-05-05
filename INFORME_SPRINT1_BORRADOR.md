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
| 1 | Crear tarea | El sistema debe permitir crear una tarea con ID, título, descripción, prioridad y fecha de vencimiento. |
| 2 | Crear tarea | El sistema debe validar que el ID no esté vacío. |
| 3 | Crear tarea | El sistema debe evitar la creación de tareas con ID duplicado. |
| 4 | Crear tarea | La prioridad solo puede ser alta, media o baja. |
| 5 | Crear tarea | La fecha de vencimiento debe registrarse en formato válido YYYY-MM-DD. |
| 6 | Buscar tarea por ID | El sistema debe permitir buscar una tarea mediante su ID. |
| 7 | Buscar tarea por ID | Si la tarea existe, el sistema debe mostrar la información completa. |
| 8 | Buscar tarea por ID | Si la tarea no existe, el sistema debe mostrar el mensaje “Tarea no encontrada”. |
| 9 | Requerimiento no funcional | La búsqueda por ID debe ejecutarse en menos de 1 segundo. |
| 10 | Requerimiento no funcional | El sistema debe cargar 50,000 tareas automáticamente para validar escalabilidad. |

---

## 2. Resultados de Pruebas Unitarias

Se implementaron pruebas unitarias automatizadas usando el módulo nativo `node:test` de Node.js.

| Nº | Prueba | Resultado | Observación |
|---|---|---|---|
| 1 | Crear tarea con datos válidos | Éxito | La tarea se registra correctamente. |
| 2 | Evitar ID duplicado | Éxito | El sistema muestra un error si el ID ya existe. |
| 3 | Buscar tarea existente por ID | Éxito | Se muestra la información completa de la tarea. |
| 4 | Buscar tarea inexistente | Éxito | El sistema devuelve `null` y muestra que la tarea no fue encontrada. |
| 5 | Validar campos obligatorios | Éxito | El sistema no permite crear tareas sin ID. |
| 6 | Tiempo de respuesta menor a 1 segundo | Éxito | La búsqueda se ejecuta en menos de 1000 ms con 50,000 tareas cargadas. |
| 7 | Carga automática de 50,000 tareas | Éxito | El sistema genera los registros de prueba correctamente. |

---

## 3. Registro de Revisión de Código

**Observaciones detectadas:**
- Al inicio se debía definir mejor la validación del ID para evitar tareas sin identificador.
- Se identificó que la prioridad debía limitarse a tres valores: alta, media y baja.
- Para mejorar el rendimiento en la búsqueda, se decidió usar una estructura `Map` en lugar de recorrer una lista completa.
- Se agregó una prueba de carga automática con 50,000 tareas para validar el requerimiento de escalabilidad.

**Mejoras aplicadas:**
- Validación de campos obligatorios.
- Validación de ID duplicado.
- Mensajes de error más claros.
- Separación del código en archivos: lógica principal, menú de consola y pruebas.
- Implementación de pruebas unitarias automatizadas.

---

## 4. Reflexión Final del Sprint

En este sprint aprendimos que la calidad no se revisa solo al final, sino durante todo el desarrollo. La definición de criterios de aceptación ayudó a saber exactamente qué debía cumplir el sistema. También comprendimos la importancia de probar el rendimiento desde el inicio, especialmente cuando existe un requisito de manejar hasta 50,000 tareas.

### Reflexión individual - Justin Gomezcoello

Durante este sprint entendí mejor cómo relacionar Scrum con la calidad de software, ya que no solo se trató de programar, sino de validar que cada funcionalidad cumpla criterios claros. También aprendí que las pruebas automatizadas ayudan a comprobar rápidamente si el sistema funciona correctamente y si cumple el tiempo de respuesta esperado.
