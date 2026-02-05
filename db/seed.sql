INSERT INTO members (name, email, member_type) VALUES
    ('Juanito', 'correodejuanito@correosmx', 'regular'),
    ('Tadeo', 'correodetadeo@correomx', 'activo'),
    ('Mateo', 'correodemateo@correomx', 'inactivo'),
    ('Lucas', 'correodelucas@correomx', 'regular'),
    ('Marcos', 'correodemarcos@correomx', 'regular');


INSERT INTO books (title, author, category, isbn) VALUES
    ('Coraline', 'Neil Gaiman', 'Fantasía', '9780380807345'),
    ('Spy x Family', 'Tatsuya Endo', 'Manga', '9781974715466'),
    ('One Piece', 'Eiichiro Oda', 'Manga', '9781569319017'),
    ('Dark Moon', 'HYBE', 'Webtoon', '9791191312456'),
    ('El Principito', 'Antoine de Saint-Exupéry', 'Clásico', '9780156012195');

INSERT INTO copies (book_id, barcode, status) VALUES
    (1, 'BC-001', 'disponible'),
    (2, 'BC-002', 'prestado'),
    (3, 'BC-003', 'prestado'),
    (4, 'BC-004', 'perdido'),
    (5, 'BC-005', 'disponible'),
    (3, 'BC-006', 'disponible'); 


INSERT INTO loans (copy_id, member_id, loaned_at, due_at, returned_at) VALUES
    (2, 1, '2025-01-01 10:02:00', '2025-01-15 10:04:00', '2025-01-14 09:38:39'),
    (3, 2, '2025-01-05 11:00:34', '2025-01-20 11:20:00', NULL),                
    (6, 4, '2025-01-10 12:02:00', '2025-01-25 12:00:50', NULL),                
    (1, 5, '2025-02-01 09:10:30', '2025-02-15 09:04:28', '2025-02-20 09:54:26');

INSERT INTO fines (loan_id, amount, paid_at) VALUES
    (4, 800.00, '2024-02-21 10:12:54'),
    (2, 200.00, NULL),                 
    (3, 500.00, NULL);