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
JOIN copies c ON b.id = c.book_id
LEFT JOIN loans l ON c.id = l.copy_id
GROUP BY b.id, b.title, b.author, b.category
ORDER BY total_loans DESC;


-- VIEW 2
-- Devuelve: Resumen de prestamos vencidos
-- Grain: Un registro miembros por pretamos vencidos
-- VERIFY: SELECT * FROM vw_overdue_loans WHERE total_overdue > 0;

CREATE OR REPLACE VIEW vw_overdue_loans AS
WITH overdue AS (
    SELECT 
        m.id AS member_id,
        m.name AS member_name,
        l.id AS loan_id,
        b.title,
        CASE 
            WHEN l.returned_at IS NULL THEN CURRENT_TIMESTAMP
            ELSE l.returned_at
        END AS calc_date,
        l.due_at
    FROM loans l
    JOIN members m ON l.member_id = m.id
    JOIN copies c ON l.copy_id = c.id
    JOIN books b ON c.book_id = b.id
    WHERE l.due_at < CURRENT_TIMESTAMP
)
SELECT 
    member_id,
    member_name,
    COUNT(loan_id) AS total_overdue,
    AVG(EXTRACT(DAY FROM (calc_date - due_at))) AS avg_days_overdue,
    SUM(EXTRACT(DAY FROM (calc_date - due_at)) * 50) AS total_suggested_fine,
    CASE 
        WHEN AVG(EXTRACT(DAY FROM (calc_date - due_at))) > 30 THEN 'Crítico'
        WHEN AVG(EXTRACT(DAY FROM (calc_date - due_at))) > 7 THEN 'Alto'
        ELSE 'Moderado'
    END AS risk_level
FROM overdue
GROUP BY member_id, member_name
HAVING COUNT(loan_id) > 0
ORDER BY total_suggested_fine DESC;


-- VISTA 3
-- Devuelve: Total de multas pagadas y pendientes por mes
-- Grain: Un registro por mes
-- VERIFY: SELECT * FROM vw_fines_summary;

CREATE OR REPLACE VIEW vw_fines_summary AS
SELECT 
    TO_CHAR(l.loaned_at, 'YYYY-MM') AS month,
    COUNT(f.id) AS total_fines,
    SUM(f.amount) AS total_amount,
    COALESCE(SUM(CASE WHEN f.paid_at IS NOT NULL THEN f.amount ELSE 0 END), 0) AS paid_amount,
    COALESCE(SUM(CASE WHEN f.paid_at IS NULL THEN f.amount ELSE 0 END), 0) AS pending_amount,
    ROUND(
        COALESCE(SUM(CASE WHEN f.paid_at IS NOT NULL THEN f.amount ELSE 0 END), 0) * 100.0 
        / NULLIF(SUM(f.amount), 0), 
        2
    ) AS payment_rate
FROM fines f
JOIN loans l ON f.loan_id = l.id
GROUP BY TO_CHAR(l.loaned_at, 'YYYY-MM')
HAVING COUNT(f.id) > 0
ORDER BY month DESC;


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