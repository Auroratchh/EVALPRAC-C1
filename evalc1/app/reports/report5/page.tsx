import KPICard from '../../report-card';
import { pool } from '@/lib/db';
import Link from 'next/link';

async function getInventoryHealth() {
  const result = await pool.query('SELECT * FROM vw_inventory_health');
  return result.rows;
}

export default async function Report5Page() {
  const inventoryData = await getInventoryHealth();
  
  const totalCopies = inventoryData.reduce((sum: number, cat: any) => sum + parseInt(cat.total_copies), 0);
  const totalAvailable = inventoryData.reduce((sum: number, cat: any) => sum + parseInt(cat.available), 0);
  const totalOnLoan = inventoryData.reduce((sum: number, cat: any) => sum + parseInt(cat.on_loan), 0);
  const totalLost = inventoryData.reduce((sum: number, cat: any) => sum + parseInt(cat.lost), 0);

  return (
    <div>
      <div className="header">
        <h1>Reporte 5: Salud de Inventario</h1>
        <p>Disponibilidad de copias por categoría</p>
        <Link href='/'>Volver</Link>
      </div>

      <div className="kpi-grid">
        <KPICard title="Total Copias" value={totalCopies} />
        <KPICard title="Disponibles" value={totalAvailable} />
        <KPICard title="En Préstamo" value={totalOnLoan} />
        <KPICard title="Perdidos" value={totalLost} subtitle="requiere atención" />
      </div>

      <div className="table-container">
        <div className="table-header">
          <h2>Estado por Categoría</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Categoría</th>
              <th className="text-center">Total</th>
              <th className="text-center">Disponibles</th>
              <th className="text-center">Prestados</th>
              <th className="text-center">Perdidos</th>
              <th className="text-center">% Disponibilidad</th>
              <th className="text-center">Estado</th>
            </tr>
          </thead>
          <tbody>
            {inventoryData.map((cat: any) => (
              <tr key={cat.category}>
                <td><span className="badge">{cat.category}</span></td>
                <td className="text-center">{cat.total_copies}</td>
                <td className="text-center">{cat.available}</td>
                <td className="text-center">{cat.on_loan}</td>
                <td className="text-center">{cat.lost}</td>
                <td className="text-center">{parseFloat(cat.availability_percent).toFixed(1)}%</td>
                <td className="text-center">
                  <span className={`badge ${
                    cat.health_status === 'Bueno' ? 'badge-moderate' :
                    cat.health_status === 'Regular' ? 'badge-high' :
                    'badge-critical'
                  }`}>
                    {cat.health_status}
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