# Analitico-Sistemas-UTN

Este proyecto es una herramienta interactiva para la planificación académica de la carrera de Ingeniería en Sistemas de Información (UTN). Permite simular, visualizar y optimizar el recorrido de materias según el plan de estudios, correlatividades, modalidades y estado actual del alumno.

## Características principales

- **Simulación de Roadmap Académico:**
  - Genera un plan óptimo año a año y cuatrimestre a cuatrimestre, mostrando qué materias cursar y cuáles rendir, en base al estado actual de cada materia (aprobada, regular, pendiente, disponible, en curso).
  - Considera correlatividades, modalidades de cursada y requisitos para cada materia.
  - Limita la cantidad de electivas a 7 y ubica la tesis/seminario al final del recorrido.
  - Permite importar/exportar el estado académico en formato JSON para continuar la planificación en cualquier momento.

- **Visualización Clara y Adaptativa:**
  - Tabla interactiva que muestra el plan sugerido, separando materias por cuatrimestre y materias a rendir (regulares).
  - Materias aprobadas no se muestran, solo las pendientes.
  - Interfaz responsive y menú adaptado para dispositivos móviles.

- **Persistencia de Estado:**
  - El estado de avance se guarda automáticamente en el navegador usando Zustand con persistencia.

- **Configuración Flexible:**
  - Fácil de adaptar a otros planes de estudio modificando el archivo `data/plan.ts`.

## Estructura del Proyecto

- `app/` - Componentes y páginas principales de la aplicación (Next.js).
  - `roadmap/` - Lógica y visualización del roadmap académico.
  - `tabla/` - Tabla de materias y estados.
- `data/plan.ts` - Definición de materias, correlatividades y modalidades.
- `lib/roadmap.ts` - Algoritmo de simulación del recorrido académico.
- `styles/` - Estilos globales y módulos CSS.


## Tecnologías utilizadas
- Next.js (React)
- TypeScript
- Zustand (state management)
- CSS Modules


## Autor

Ignacio Galoppo

---

¡Contribuciones y sugerencias son bienvenidas!
