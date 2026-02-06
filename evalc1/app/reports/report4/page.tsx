import KPICard from '../../report-card';
import { pool } from '@/lib/db';

async function getMemberActivity() {
  const result = await pool.query('SELECT * FROM vw_member_activity');
  return result.rows;
}

export default async function Report4Page() {
  const membersData = await getMemberActivity();
  
  const totalMembers = membersData.length;
  const excellentMembers = membersData.filter((m: any) => m.status === 'Excelente').length;
  const totalLoans = membersData.reduce((sum: number, m: any) => sum + parseInt(m.total_loans), 0);
  const avgOverdueRate = totalMembers > 0 
    ? (membersData.reduce((sum: number, m: any) => sum + parseFloat(m.overdue_rate), 0) / totalMembers).toFixed(1)
    : '0';

  return (
    <div>
      <div className="header">
        <h1>Reporte 4: Actividad de Miembros</h1>
        <p>Estadísticas de préstamos y atrasos por usuario</p>
      </div>

      <div className="kpi-grid">
        <KPICard title="Miembros Activos" value={totalMembers} />
        <KPICard title="Total Préstamos" value={totalLoans} />
        <KPICard title="Miembros Excelentes" value={excellentMembers} subtitle="sin atrasos" />
        <KPICard title="Tasa Promedio Atraso" value={`${avgOverdueRate}%`} />
      </div>

      <div className="table-container">
        <div className="table-header">
          <h2>Actividad por Miembro</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Tipo</th>
              <th className="text-center">Préstamos</th>
              <th className="text-center">Vencidos</th>
              <th className="text-center">Tasa Atraso</th>
              <th className="text-center">Estado</th>
            </tr>
          </thead>
          <tbody>
            {membersData.map((member: any) => (
              <tr key={member.id}>
                <td>{member.name}</td>
                <td>{member.email}</td>
                <td><span className="badge">{member.member_type}</span></td>
                <td className="text-center">{member.total_loans}</td>
                <td className="text-center">{member.overdue_loans}</td>
                <td className="text-center">{parseFloat(member.overdue_rate).toFixed(1)}%</td>
                <td className="text-center">
                  <span className={`badge ${
                    member.status === 'Excelente' ? 'badge-moderate' :
                    member.status === 'Bueno' ? 'badge-high' :
                    'badge-critical'
                  }`}>
                    {member.status}
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