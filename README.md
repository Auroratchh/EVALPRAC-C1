# Evaluación Práctica Unidad 1 - AWOS y BDA 5°C
## Reportes para Biblioteca

#### Requisitos
* **Docker** y **Docker Compose** instalado.

#### Ejecutar el proyecto completo
bash
```
docker compose up --build
```
La aplicación estará disponible en: http://localhost:3000

## Reportes Implementados
Reporte	Ruta	Componentes Técnicos
1. Libros Más Prestados	/reports/report1	RANK(), Zod Validation, Paginación
2. Préstamos Vencidos	/reports/report2	CTE, CASE (días de atraso), Paginación
3. Resumen de Multas	/reports/report3	HAVING, CASE (clasificación), Rango de fechas
4. Actividad de Miembros	/reports/report4	HAVING, COALESCE, CASE (estados)
5. Salud de Inventario	/reports/report5	Aggregates, ROUND (porcentajes), CASE

## Se conecta con un usuario restringido:

    Usuario: user_nuevo

    Permisos: Únicamente SELECT sobre las VIEWS. Las tablas base están protegidas.


## Índices y Optimización

Se han implementado índices estratégicos en db/04_indexes.sql para mejorar el rendimiento de las consultas frecuentes.
Evidencia EXPLAIN ANALYZE

#### Consulta 1: Búsqueda de libros por título
SQL

EXPLAIN ANALYZE SELECT * FROM vw_most_borrowed_books WHERE title ILIKE '%Coraline%';

#### Consulta 2: Préstamos vencidos
SQL

EXPLAIN ANALYZE SELECT * FROM vw_overdue_loans WHERE days_overdue >= 5;


## Tecnologías Utilizadas

    Backend: PostgreSQL 16 (Alpine)

    Frontend: Next.js 16 (App Router, TypeScript)

    Containerización: Docker + Docker Compose


## Datos del Alumno

    Nombre: Brittany Aurora Hernández Muñoz

    Matricula: 243707

    Materia: AWOS

    Fecha: Viernes 06 de Febrero 2026
