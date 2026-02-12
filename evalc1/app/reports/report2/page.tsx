import KPICard from '../../report-card';
import { getOverdueData } from '@/lib/queries';
import Link from 'next/link';

export default async function Report2Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; min_days?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || '1') || 1;
  const minDays = params.min_days || '';
  
  const { rows: overdue, total, limit } = await getOverdueData(page, minDays);
  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="header">
        <h1>Reporte 2: Préstamos Vencidos</h1>
        <p>Listado de usuarios con libros pendientes de entrega</p>
        <Link href='/'>Volver</Link>
      </div>

      <form className="filter-container" method="get" action="/reports/report2">
        <label>Días mínimos de atraso: </label>
        <input 
          type="number" 
          name="min_days" 
          defaultValue={minDays} 
          className="search-input" 
          style={{ width: '80px', margin: '0 10px' }} 
        />
        <button type="submit" className="btn-primary">Filtrar</button>
        <Link href="/reports/report2" className="btn-primary" style={{ marginLeft: '5px' }}>
          Limpiar
        </Link>
      </form>

      <div className="kpi-grid">
        <KPICard title="Total Vencidos" value={total} />
        <KPICard 
          title="Máximo Atraso" 
          value={`${overdue.length > 0 ? Math.max(0, overdue[0].days_overdue) : 0} días`} 
        />
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Libro</th>
              <th className="text-center">Días Atraso</th>
              <th className="text-center">Multa Sugerida</th>
            </tr>
          </thead>
          <tbody>
            {overdue.map((row, idx) => (
              <tr key={`${row.loan_id}-${idx}`}>
                <td>{row.member_name}</td>
                <td>{row.title || 'Libro no encontrado'}</td>
                <td className="text-center">
                  <span>{Math.max(0, row.days_overdue)}</span>
                </td>
                <td className="text-center">${Math.max(0, Number(row.suggested_fine))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          {page > 1 && (
            <Link 
              href={`/reports/report2?page=${page - 1}${minDays ? `&min_days=${minDays}` : ''}`} 
              className="nav-link"
            >
              Anterior
            </Link>
          )}
          <span className="page-number">Página {page} de {totalPages}</span>
          {page < totalPages && (
            <Link 
              href={`/reports/report2?page=${page + 1}${minDays ? `&min_days=${minDays}` : ''}`} 
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