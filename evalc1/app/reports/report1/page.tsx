import KPICard from '../../report-card';
import { getBooksData } from '@/lib/queries';
import Link from 'next/link';

export default async function Report1Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || '1') || 1;
  const search = params.search || '';
  
  const { rows: books, total, limit } = await getBooksData(page, search);
  const totalPages = Math.ceil(total / limit);
  
  const totalBooks = total;
  const totalLoans = books.reduce((sum, book) => sum + parseInt(book.total_loans || '0'), 0);
  const topBook = books.length > 0 ? books[0].title : 'N/A';

  return (
    <div>
      <div className="header">
        <h1>Reporte 1: Libros Más Prestados</h1>
        <p>Ranking basado en el historial de préstamos</p>
        <Link href='/'>Volver</Link>
      </div>

      <form className="filter-container" method="get" action="/reports/report1">
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
          Limpiar
        </Link>
      </form>

      <div className="kpi-grid">
        <KPICard title="Libros en Ranking" value={totalBooks} />
        <KPICard title="Total Préstamos" value={totalLoans} />
        <KPICard title="Libro Top" value={topBook} />
      </div>

      <div className="table-container">
        <div className="table-header">
          <h2>Ranking de Libros</h2>
        </div>
        {books.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            No se encontraron resultados para su búsqueda.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th className="text-center">Ranking</th>
                <th>Título</th>
                <th>Autor</th>
                <th>Categoría</th>
                <th className="text-center">Préstamos</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book.id}>
                  <td className="text-center">
                    <span className="rank-badge">#{book.rank_position}</span>
                  </td>
                  <td>{book.title}</td>
                  <td>{book.author}</td>
                  <td>
                    <span className="category-badge">{book.category}</span>
                  </td>
                  <td className="text-center">
                    <span className="loan-count">{book.total_loans}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          {page > 1 && (
            <Link 
              href={`/reports/report1?page=${page - 1}${search ? `&search=${encodeURIComponent(search)}` : ''}`}
              className="nav-link"
            >
              Anterior
            </Link>
          )}
          <span className="page-number">Página {page} de {totalPages}</span>
          {page < totalPages && (
            <Link 
              href={`/reports/report1?page=${page + 1}${search ? `&search=${encodeURIComponent(search)}` : ''}`}
              className="nav-link"
            >
              Siguiente
            </Link>
          )}
        </div>
      )}
    </div>
  );
}