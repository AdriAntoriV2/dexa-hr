import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
}

export function StatCard({
  label,
  value,
  description,
  icon: Icon,
}: StatCardProps) {
  return (
    <section className="stat-card">
      <div className="stat-card-top">
        <span>{label}</span>
        <div className="stat-icon">
          <Icon size={19} />
        </div>
      </div>

      <strong className="stat-value">{value}</strong>
      <span className="stat-description">{description}</span>
    </section>
  );
}
