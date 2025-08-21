# Analitico-Sistemas-UTN

Esta aplicación es un analítico interactivo para estudiantes de Ingeniería en Sistemas de Información (UTN). Permite llevar un registro de todas las materias de la carrera, su estado (aprobada, regular, pendiente, en curso), notas, porcentaje de avance y promedio.

## Características principales

- **Registro de materias:** Marca materias como aprobadas, regulares, en curso o pendientes. Guarda tu progreso.
- **Porcentaje de avance:** Visualiza el porcentaje completado de la carrera en tiempo real.
- **Resumen y estadísticas:** Consulta cuántas materias llevás aprobadas, cuántas te faltan, cuántas son electivas, y tu promedio general.
- **Importar/exportar estado:** Podés guardar tu avance en un archivo JSON y restaurarlo en cualquier momento o dispositivo.
- **Visualización clara:** Tabla interactiva para ver tu situación académica de un vistazo. Interfaz responsive y menú adaptado a dispositivos móviles.

## Estructura del Proyecto

- `app/` - Componentes y páginas principales de la aplicación (Next.js).
- `tabla/` - Tabla de materias y estados.
- `data/plan.ts` - Definición de materias, correlatividades, modalidades y años.
- `styles/` - Estilos globales y módulos CSS.


## Deploy online

Podés usar la app directamente desde Vercel, sin instalar nada:

👉 [analitico-sistemas-utn.vercel.app](https://analitico-sistemas-utn.vercel.app/)

---

## Instalación y uso local

1. Cloná el repositorio:
  ```bash
  git clone https://github.com/galoppoignacio/Analitico-Sistemas-UTN.git
  cd Analitico-Sistemas-UTN
  ```
2. Instalá las dependencias:
  ```bash
  npm install
  ```
3. Iniciá la aplicación en modo desarrollo:
  ```bash
  npm run dev
  ```
4. Accedé a la app en [http://localhost:3000](http://localhost:3000)

## Personalización

- Para adaptar el plan de materias, editá el archivo `data/plan.ts`.
- Para cambiar estilos, modificá los archivos en `styles/`.

## Tecnologías utilizadas
- Next.js (React)
- TypeScript
- Zustand (state management)
- CSS Modules

## Licencia

MIT. Ver el archivo LICENSE para más información.

## Autor

Ignacio Galoppo

---

¡Contribuciones y sugerencias son bienvenidas!
