-- VIEWS 

-- VIEW 1
-- Devuelve: Ranking de libros por cantidad de prestamos
-- Grain: Un registro por libro
-- VERIFY: SELECT * FROM vw_most_borrowed_books LIMIT 5;

CREATE OR REPLACE VIEW vw_most_borrowed_books AS
SELECT 
    b.id,
    b.title,
    b.author,
    b.category,
    COUNT(l.id) AS total_loans,
    RANK() OVER (ORDER BY COUNT(l.id) DESC) AS rank_position
FROM books b
LEFT JOIN copies c ON b.id = c.book_id
LEFT JOIN loans l ON c.id = l.copy_id
GROUP BY b.id, b.title, b.author, b.category;


-- VIEW 2
-- Devuelve: Resumen de prestamos vencidos
-- Grain: Un registro por miembros con pretamos vencidos
-- VERIFY: SELECT * FROM vw_overdue_loans;

CREATE OR REPLACE VIEW vw_overdue_loans AS
SELECT 
    m.id AS member_id,
    m.name AS member_name,
    l.id AS loan_id,
    b.title AS title,
    l.due_at,
    CASE 
        WHEN l.returned_at IS NULL THEN EXTRACT(DAY FROM (CURRENT_TIMESTAMP - l.due_at))
        ELSE EXTRACT(DAY FROM (l.returned_at - l.due_at))
    END::INTEGER AS days_overdue,
    ((CASE 
        WHEN l.returned_at IS NULL THEN EXTRACT(DAY FROM (CURRENT_TIMESTAMP - l.due_at))
        ELSE EXTRACT(DAY FROM (l.returned_at - l.due_at))
    END) * 50)::DECIMAL(10,2) AS suggested_fine
FROM loans l
JOIN members m ON l.member_id = m.id
JOIN copies c ON l.copy_id = c.id
JOIN books b ON c.book_id = b.id
WHERE (l.returned_at IS NULL AND l.due_at < CURRENT_TIMESTAMP)
   OR (l.returned_at IS NOT NULL AND l.returned_at > l.due_at);

-- VISTA 3
-- Devuelve: Total de multas pagadas y pendientes por mes
-- Grain: Un registro por mes
-- VERIFY: SELECT * FROM vw_fines_summary;

CREATE OR REPLACE VIEW vw_fines_summary AS
SELECT 
    TO_CHAR(l.due_at, 'YYYY-MM') AS month,
    COUNT(l.id) AS total_fines,
    SUM(CASE WHEN l.returned_at > l.due_at OR (l.returned_at IS NULL AND l.due_at < CURRENT_TIMESTAMP) THEN 50 ELSE 0 END) AS total_amount,
    SUM(CASE WHEN l.returned_at IS NOT NULL THEN 50 ELSE 0 END) AS paid_amount,
    SUM(CASE WHEN l.returned_at IS NULL AND l.due_at < CURRENT_TIMESTAMP THEN 50 ELSE 0 END) AS pending_amount,
    CASE 
        WHEN SUM(CASE WHEN l.due_at < CURRENT_TIMESTAMP THEN 50 ELSE 0 END) > 0 
        THEN (SUM(CASE WHEN l.returned_at IS NOT NULL THEN 50 ELSE 0 END) * 100.0 / NULLIF(SUM(CASE WHEN l.due_at < CURRENT_TIMESTAMP THEN 50 ELSE 0 END), 0))
        ELSE 0 
    END AS payment_rate
FROM loans l
GROUP BY TO_CHAR(l.due_at, 'YYYY-MM');

GRANT SELECT ON vw_fines_summary TO user_nuevo;


-- VIEW 4
-- Devuelve: Estadisticas de prestamos y atrasos por usuario
-- Grain: Un registro por usuario activo
-- VERIFY: 
-- SELECT * FROM vw_member_activity;

CREATE OR REPLACE VIEW vw_member_activity AS
SELECT 
    m.id,
    m.name,
    m.email,
    m.member_type,
    COUNT(l.id) AS total_loans,
    COALESCE(SUM(CASE 
        WHEN l.returned_at IS NULL AND l.due_at < CURRENT_TIMESTAMP THEN 1
        WHEN l.returned_at > l.due_at THEN 1
        ELSE 0
    END), 0) AS overdue_loans,
    ROUND(
        COALESCE(SUM(CASE 
            WHEN l.returned_at IS NULL AND l.due_at < CURRENT_TIMESTAMP THEN 1
            WHEN l.returned_at > l.due_at THEN 1
            ELSE 0
        END), 0) * 100.0 / NULLIF(COUNT(l.id), 0),
        2
    ) AS overdue_rate,
    CASE 
        WHEN COALESCE(SUM(CASE 
            WHEN l.returned_at IS NULL AND l.due_at < CURRENT_TIMESTAMP THEN 1
            WHEN l.returned_at > l.due_at THEN 1
            ELSE 0
        END), 0) = 0 THEN 'Excelente'
        WHEN COALESCE(SUM(CASE 
            WHEN l.returned_at IS NULL AND l.due_at < CURRENT_TIMESTAMP THEN 1
            WHEN l.returned_at > l.due_at THEN 1
            ELSE 0
        END), 0) * 100.0 / NULLIF(COUNT(l.id), 0) < 30 THEN 'Bueno'
        ELSE 'Necesita mejorar'
    END AS status
FROM members m
LEFT JOIN loans l ON m.id = l.member_id
GROUP BY m.id, m.name, m.email, m.member_type
HAVING COUNT(l.id) > 0
ORDER BY total_loans DESC;


-- VIEW 5
-- Devuelve: Disponibilidad de copias por categoría
-- Grain: Un registro por categoría
-- VERIFY: SELECT * FROM vw_inventory_health;

CREATE OR REPLACE VIEW vw_inventory_health AS
SELECT 
    b.category,
    COUNT(c.id) AS total_copies,
    SUM(CASE WHEN c.status = 'disponible' THEN 1 ELSE 0 END) AS available,
    SUM(CASE WHEN c.status = 'prestado' THEN 1 ELSE 0 END) AS on_loan,
    SUM(CASE WHEN c.status = 'perdido' THEN 1 ELSE 0 END) AS lost,
    ROUND(
        SUM(CASE WHEN c.status = 'disponible' THEN 1 ELSE 0 END) * 100.0 
        / NULLIF(COUNT(c.id), 0),
        2
    ) AS availability_percent,
    CASE 
        WHEN SUM(CASE WHEN c.status = 'disponible' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(c.id), 0) >= 50 THEN 'Bueno'
        WHEN SUM(CASE WHEN c.status = 'disponible' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(c.id), 0) >= 25 THEN 'Regular'
        ELSE 'Crítico'
    END AS health_status
FROM books b
JOIN copies c ON b.id = c.book_id
GROUP BY b.category
ORDER BY availability_percent ASC;