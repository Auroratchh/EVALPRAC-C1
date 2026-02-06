import KPICard from '../../report-card';
import { pool } from '@/lib/db';
import Link from 'next/link';

async function getOverdueData(page: number, minDays?: number) {
  const limit = 10;
  const offset = (page - 1) * limit;
  
  let query = 'SELECT * FROM vw_overdue_loans';
  const params: any[] = [];
  
  if (minDays) {
    query += ' WHERE avg_days_overdue >= $1';
    params.push(minDays);
    query += ` LIMIT $2 OFFSET $3`;
    params.push(limit, offset);
  } else {
    query += ` LIMIT $1 OFFSET $2`;
    params.push(limit, offset);
  }
  
  const result = await pool.query(query, params);
  
  const countQuery = minDays 
    ? 'SELECT COUNT(*) FROM vw_overdue_loans WHERE avg_days_overdue >= $1'
    : 'SELECT COUNT(*) FROM vw_overdue_loans';
  const countParams = minDays ? [minDays] : [];
  const countResult = await pool.query(countQuery, countParams);
  const total = parseInt(countResult.rows[0].count);
  
  return { rows: result.rows, total };
}

export default async function Report2Page({
  searchParams,
}: {
  searchParams: { page?: string; min_days?: string };
}) {
  const page = parseInt(searchParams.page || '1');
  const minDays = searchParams.min_days ? parseInt(searchParams.min_days) : undefined;
  
  const { rows: overdueData, total } = await getOverdueData(page, minDays);
  const totalPages = Math.ceil(total / 10);
  
  const totalMembers = overdueData.length;
  const totalOverdue = overdueData.reduce((sum: number, member: any) => 
    sum + Number(member.total_overdue), 0
  );
  const totalFines = overdueData.reduce((sum: number, member: any) => 
    sum + Number(member.total_suggested_fine), 0
  ).toFixed(2);
  const criticalMembers = overdueData.filter((m: any) => 
    m.risk_level === 'Crítico'
  ).length;

  return (
    <div>
      <div className="header">
        <h1>Reporte 2: Préstamos Vencidos</h1>
        <p>Análisis de atrasos por socio</p>
      </div>

      <form className="filter-container" method="get">
        <input
          type="number"
          name="min_days"
          defaultValue={minDays}
          className="search-input"
          placeholder="Días mínimos de atraso"
          min="0"
        />
        <button type="submit" className="btn-primary">
          Filtrar
        </button>
        <Link href="/reports/report2" className="btn-primary">
          Ver Todos
        </Link>
      </form>

      <div className="kpi-grid">
        <KPICard title="Usuarios con Atrasos" value={totalMembers} />
        <KPICard title="Préstamos Vencidos" value={totalOverdue} />
        <KPICard title="Multas Sugeridas" value={`$${totalFines}`} />
        <KPICard title="Casos Críticos" value={criticalMembers} subtitle="más de 30 días" />
      </div>

      <div className="table-container">
        <div className="table-header">
          <h2>Usuarios con Préstamos Vencidos</h2>
        </div>
        <table>
          <thead>  
            <tr>
              <th>Usuario</th>
              <th className="text-center">Total Vencidos</th>
              <th className="text-center">Promedio Días</th>
              <th className="text-right">Multa Sugerida</th>
              <th className="text-center">Nivel Riesgo</th>
            </tr>
          </thead>
          <tbody>
            {overdueData.map((member: any) => (
              <tr key={member.member_id}>
                <td>{member.member_name}</td>
                <td className="text-center">{member.total_overdue}</td>
                <td className="text-center">
                  {Number(member.avg_days_overdue).toFixed(1)}
                </td>
                <td className="text-right">
                  ${Number(member.total_suggested_fine).toFixed(2)}
                </td>
                <td className="text-center">
                  <span className={`badge ${
                    member.risk_level === 'Crítico' ? 'badge-critical' :
                    member.risk_level === 'Alto' ? 'badge-high' :
                    'badge-moderate'
                  }`}>
                    {member.risk_level}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
    </div>
  );
}