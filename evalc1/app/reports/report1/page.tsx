import KPICard from '../../report-card';
import { pool } from '@/lib/db';
import Link from 'next/link';

async function getBooksData(page: number, search?: string) {
  const limit = 10;
  const offset = (page - 1) * limit;
  
  let query = 'SELECT * FROM vw_most_borrowed_books';
  const params: any[] = [];
  
  if (search) {
    query += ' WHERE title ILIKE $1 OR author ILIKE $1';
    params.push(`%${search}%`);
    query += ` LIMIT $2 OFFSET $3`;
    params.push(limit, offset);
  } else {
    query += ` LIMIT $1 OFFSET $2`;
    params.push(limit, offset);
  }
  
  const result = await pool.query(query, params);
  
  const countQuery = search 
    ? 'SELECT COUNT(*) FROM vw_most_borrowed_books WHERE title ILIKE $1 OR author ILIKE $1'
    : 'SELECT COUNT(*) FROM vw_most_borrowed_books';
  const countParams = search ? [`%${search}%`] : [];
  const countResult = await pool.query(countQuery, countParams);
  const total = parseInt(countResult.rows[0].count);
  
  const totalLoansQuery = search
    ? 'SELECT COALESCE(SUM(total_loans), 0) as sum FROM vw_most_borrowed_books WHERE title ILIKE $1 OR author ILIKE $1'
    : 'SELECT COALESCE(SUM(total_loans), 0) as sum FROM vw_most_borrowed_books';
  const totalLoansResult = await pool.query(totalLoansQuery, countParams);
  const totalLoans = parseInt(totalLoansResult.rows[0].sum);
  
  return { rows: result.rows, total, totalLoans };
}

export default async function Report1Page({
  searchParams,
}: {
  searchParams: { page?: string; search?: string };
}) {
  const page = parseInt(searchParams.page || '1');
  const search = searchParams.search;
  
  const { rows: booksData, total, totalLoans } = await getBooksData(page, search);
  const totalPages = Math.ceil(total / 10);
  
  const mostBorrowedBook = booksData[0] || { title: 'N/A', total_loans: 0 };

  return (
    <div>
      <div className="header">
        <h1>Reporte 1: Libros más prestados</h1>
        <p>Ranking de libros por cantidad de préstamos</p>
      </div>

      <form className="filter-container" method="get">
        <input
          type="text"
          name="search"
          defaultValue={search}
          className="search-input"
          placeholder="Buscar por título o autor"
        />
        <button type="submit" className="btn-primary">
          Buscar
        </button>
        <Link href="/reports/report1" className="btn-primary">
          Ver Todos
        </Link>
      </form>

      <div className="kpi-grid">
        <KPICard title="Total de Libros" value={total} />
        <KPICard title="Total de Préstamos" value={totalLoans} />
        <KPICard 
          title="Libro Más Prestado" 
          value={mostBorrowedBook.title} 
          subtitle={`${mostBorrowedBook.total_loans} préstamos`}
        />
      </div>

      <div className="table-container">
        <div className="table-header">
          <h2>Ranking de Libros por Préstamos</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th className="text-center">Ranking</th>
              <th>Título</th>
              <th>Autor</th>
              <th>Categoría</th>
              <th className="text-right">Total Préstamos</th>
            </tr>
          </thead>
          <tbody>
            {booksData.map((book: any) => (
              <tr key={book.id}>
                <td className="text-center">
                  <span className="ranking-badge">#{book.rank_position}</span>
                </td>
                <td>{book.title}</td>
                <td>{book.author}</td>
                <td><span className="badge">{book.category}</span></td>
                <td className="text-right">{book.total_loans}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        {page > 1 && (
          <Link 
            href={`/reports/report1?page=${page - 1}${search ? `&search=${search}` : ''}`}
            className="nav-link"
          >
            Anterior
          </Link>
        )}
        <span className="page-number">Página {page} de {totalPages}</span>
        {page < totalPages && (
          <Link 
            href={`/reports/report1?page=${page + 1}${search ? `&search=${search}` : ''}`}
            className="nav-link"
          >
            Siguiente
          </Link>
        )}
      </div>
    </div>
  );
}