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
-- Devuelve: Prestamos no devueltos a tiempo con dias de atraso
-- Grain: Un registro por prestamo vencido
-- VERIFY: SELECT * FROM vw_overdue_loans WHERE days_overdue > 5;

CREATE OR REPLACE VIEW vw_overdue_loans AS
WITH overdue AS (
    SELECT 
        l.id,
        m.name AS member_name,
        b.title AS book_title,
        l.loaned_at,
        l.due_at,
        l.returned_at,
        CASE 
            WHEN l.returned_at IS NULL THEN CURRENT_TIMESTAMP
            ELSE l.returned_at
        END AS calc_date
    FROM loans l
    JOIN members m ON l.member_id = m.id
    JOIN copies c ON l.copy_id = c.id
    JOIN books b ON c.book_id = b.id
    WHERE l.due_at < CURRENT_TIMESTAMP
)
SELECT 
    id,
    member_name,
    book_title,
    loaned_at,
    due_at,
    returned_at,
    EXTRACT(DAY FROM (calc_date - due_at))::INTEGER AS days_overdue,
    EXTRACT(DAY FROM (calc_date - due_at))::INTEGER * 50 AS suggested_fine,
    CASE 
        WHEN returned_at IS NULL THEN 'Pendiente'
        ELSE 'Devuelto tarde'
    END AS status
FROM overdue;


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
-- Devuelve: Estadisticas de prestamos y atrasos por socio
-- Grain: Un registro por socio activo
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