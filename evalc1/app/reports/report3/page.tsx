import KPICard from '../../report-card';
import { getFinesData } from '@/lib/queries';
import Link from 'next/link';

export default async function Report3Page({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  const currentMonth = params.month || '';
  
  const finesData = await getFinesData(currentMonth);
  
  const totalFines = finesData.reduce((sum, m) => sum + Number(m.total_fines), 0);
  const totalAmount = finesData.reduce((sum, m) => sum + Number(m.total_amount), 0);
  const totalPaid = finesData.reduce((sum, m) => sum + Number(m.paid_amount), 0);
  const totalPending = totalAmount - totalPaid;

  return (
    <div>
      <div className="header">
        <h1>Reporte 3: Resumen de Multas</h1>
        <p>Multas pagadas y pendientes por mes</p>
        <Link href='/'>Volver</Link>
      </div>

      <form className="filter-container" method="get">
        <input
          type="month"
          name="month"
          defaultValue={currentMonth}
          className="search-input"
        />
        <button type="submit" className="btn-primary" style={{ marginLeft: '10px' }}>
          Filtrar
        </button>
        <Link href="/reports/report3" className="btn-primary" style={{ marginLeft: '10px' }}>
          Ver Todos
        </Link>
      </form>

      <div className="kpi-grid">
        <KPICard title="Total Multas" value={totalFines} />
        <KPICard title="Monto Total" value={`$${totalAmount.toFixed(2)}`} />
        <KPICard title="Pagado" value={`$${totalPaid.toFixed(2)}`} />
        <KPICard title="Pendiente" value={`$${totalPending.toFixed(2)}`} />
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Mes</th>
              <th className="text-center">Multas</th>
              <th className="text-right">Total</th>
              <th className="text-right">Pagado</th>
              <th className="text-right">Pendiente</th>
              <th className="text-center">% Pago</th>
            </tr>
          </thead>
          <tbody>
            {finesData.map((m) => (
              <tr key={m.month}>
                <td>{m.month}</td>
                <td className="text-center">{m.total_fines}</td>
                <td className="text-right">${Number(m.total_amount).toFixed(2)}</td>
                <td className="text-right">${Number(m.paid_amount).toFixed(2)}</td>
                <td className="text-right">${Number(m.pending_amount).toFixed(2)}</td>
                <td className="text-center">{Number(m.payment_rate).toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}