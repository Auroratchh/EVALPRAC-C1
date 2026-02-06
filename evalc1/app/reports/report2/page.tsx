import KPICard from '../../report-card';
import { pool } from '@/lib/db';

async function getOverdueData() {
  const result = await pool.query('SELECT * FROM vw_overdue_loans');
  return result.rows;
}

export default async function Report2Page() {
  const overdueData = await getOverdueData();
  
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

      <div className="kpi-grid">
        <KPICard 
          title="Usuarios con Atrasos" 
          value={totalMembers} 
        />
        <KPICard 
          title="Préstamos Vencidos" 
          value={totalOverdue} 
        />
        <KPICard 
          title="Multas Sugeridas" 
          value={`$${totalFines}`} 
        />
        <KPICard 
          title="Casos Críticos" 
          value={criticalMembers} 
          subtitle="más de 30 días"
        />
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
    </div>
  );
}