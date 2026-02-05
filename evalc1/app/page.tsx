import Link from 'next/link';

const reports = [
  { id: 1, title: 'Reporte 1', href: '/reports/report1'},
  { id: 2, title: 'Reporte 2', href: '/reports/report2' },
  { id: 3, title: 'Reporte 3', href: '/reports/report3'},
  { id: 4, title: 'Reporte 4', href: '/reports/report4'},
  { id: 5, title: 'Reporte 5', href: '/reports/report5'},
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