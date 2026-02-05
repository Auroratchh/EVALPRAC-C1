import KPICard from '../../report-card';
import { pool } from '@/lib/db';

async function getBooksData() {
  const result = await pool.query('SELECT * FROM vw_most_borrowed_books');
  return result.rows;
}

export default async function Report1Page() {
  const booksData = await getBooksData();
  
  const totalBooks = booksData.length;
  const totalLoans = booksData.reduce((sum: number, book: any) => sum + book.total_loans, 0);
  const mostBorrowedBook = booksData[0] || { title: 'N/A', total_loans: 0 };
  const avgLoans = totalBooks > 0 ? (totalLoans / totalBooks).toFixed(1) : '0';

  return (
    <div>
      <div className="header">
        <h1>Reporte 1: Libros Más Prestados</h1>
        <p>Ranking de libros por cantidad de préstamos</p>
      </div>

      <div className="kpi-grid">
        <KPICard 
          title="Total de Libros" 
          value={totalBooks} 
        />
        <KPICard 
          title="Total de Préstamos" 
          value={totalLoans} 
        />
        <KPICard 
          title="Libro Más Prestado" 
          value={mostBorrowedBook.title} 
          subtitle={`${mostBorrowedBook.total_loans} préstamos`}
        />
        <KPICard 
          title="Promedio de Préstamos" 
          value={avgLoans} 
          subtitle="por libro"
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
                  <span className="ranking-badge">
                    #{book.rank_position}
                  </span>
                </td>
                <td>{book.title}</td>
                <td>{book.author}</td>
                <td>
                  <span className="badge">
                    {book.category}
                  </span>
                </td>
                <td className="text-right">
                  {book.total_loans}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}