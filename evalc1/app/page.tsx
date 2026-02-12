import Link from 'next/link';

const reports = [
  { id: 1, title: 'Reporte 1: Ranking basado en el historial de préstamos ', href: '/reports/report1'},
  { id: 2, title: 'Reporte 2: Listado de usuarios con libros pendientes de entrega', href: '/reports/report2' },
  { id: 3, title: 'Reporte 3: Resumen de Multas', href: '/reports/report3'},
  { id: 4, title: 'Reporte 4: Estadísticas de préstamos y atrasos por usuario', href: '/reports/report4'},
  { id: 5, title: 'Reporte 5: Disponibilidad de copias por categoría', href: '/reports/report5'},
];

export default function HomePage() {
  return (
    <div>
      <div className="header">
        <h1>Reportes</h1>
        <p>Evaluación Práctica Unidad 1 AWOS y BDA 5°C</p>
      </div>

      <div className="report-grid">
        {reports.map((report) => (
          <Link key={report.id} href={report.href} className="report-card">
            <h3>{report.title}</h3>
          </Link>
        ))}
      </div>
    </div>
  );
}