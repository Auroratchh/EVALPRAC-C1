interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
}

export default function KPICard({ title, value, subtitle}: KPICardProps) {
  return (
    <div className={`kpi-card kpi-`}>
      <h3>{title}</h3>
      <div className="value">{value}</div>
      {subtitle && <div className="subtitle">{subtitle}</div>}
    </div>
  );
}