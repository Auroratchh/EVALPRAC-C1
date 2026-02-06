INSERT INTO members (name, email, member_type) VALUES
    ('Juanito', 'correodejuanito@correosmx', 'regular'),
    ('Tadeo', 'correodetadeo@correomx', 'activo'),
    ('Mateo', 'correodemateo@correomx', 'inactivo'),
    ('Lucas', 'correodelucas@correomx', 'regular'),
    ('Marcos', 'correodemarcos@correomx', 'regular'),
    ('Eliseo', 'correodeeliseo@correomx', 'regular'),


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
    (1, 1, '2024-11-01', '2024-11-10', NULL),
    (2, 2, '2024-11-05', '2024-11-15', NULL),
    (3, 3, '2024-11-10', '2024-11-20', NULL),
    (5, 4, '2024-11-12', '2024-11-22', NULL),
    (6, 5, '2024-11-15', '2024-11-25', NULL),
    (1, 6, '2024-11-20', '2024-11-30', NULL),
    (2, 1, '2024-12-01', '2024-12-10', NULL),
    (3, 2, '2024-12-05', '2024-12-15', NULL),
    (5, 3, '2024-12-10', '2024-12-20', NULL),
    (6, 4, '2024-12-15', '2024-12-25', NULL);

INSERT INTO fines (loan_id, amount, paid_at) VALUES
    (4, 250.00, '2025-02-06 10:12:54'), 
    (2, 1000.00, NULL),                  
    (3, 750.00, NULL),                    
    (5, 1750.00, NULL);