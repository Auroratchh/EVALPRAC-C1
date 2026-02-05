-- Para busqueda de libros por titulo o autor
CREATE INDEX idx_books_title ON books (title);
CREATE INDEX idx_books_author ON books (author);

-- Para encontrar prestamos vencidos mas rapido
CREATE INDEX idx_loans_due_at ON loans (due_at);

-- Para JOINs entre tablas
CREATE INDEX idx_copies_book_id ON copies (book_id);
CREATE INDEX idx_loans_copy_id ON loans (copy_id);
CREATE INDEX idx_loans_member_id ON loans (member_id);
CREATE INDEX idx_fines_loan_id ON fines (loan_id);

-- Para filtrar copias por estado
CREATE INDEX idx_copies_status ON copies (status);

-- Para distinguir multas pagadas y pendientes
CREATE INDEX idx_fines_paid ON fines (paid_at);