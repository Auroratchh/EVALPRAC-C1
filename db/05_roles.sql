-- user
DROP USER IF EXISTS user_nuevo;
CREATE USER user_nuevo WITH PASSWORD 'contrauser';

-- Permite conectarse a la BD
GRANT CONNECT ON DATABASE biblioteca TO user_nuevo;
GRANT USAGE ON SCHEMA public TO user_nuevo;

-- Solo se visualiza 
GRANT SELECT ON vw_most_borrowed_books TO user_nuevo;
GRANT SELECT ON vw_overdue_loans TO user_nuevo;
GRANT SELECT ON vw_fines_summary TO user_nuevo;
GRANT SELECT ON vw_member_activity TO user_nuevo;
GRANT SELECT ON vw_inventory_health TO user_nuevo;

-- El usuario no puede leer directamente las tablas
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM user_nuevo;