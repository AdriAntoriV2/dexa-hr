import {
  Users,
  CalendarCheck,
  Clock3,
  UserCheck,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/ui/PageHeader';
import { StatCard } from '../components/ui/StatCard';
import { Card } from '../components/ui/Card';

const stats = [
  {
    label: 'Total employees',
    value: '—',
    description: 'Employee directory',
    icon: Users,
  },
  {
    label: 'Present today',
    value: '—',
    description: "Today's check-ins",
    icon: UserCheck,
  },
  {
    label: 'Late arrivals',
    value: '—',
    description: 'Based on attendance status',
    icon: Clock3,
  },
  {
    label: 'Attendance records',
    value: '—',
    description: 'Today\'s records',
    icon: CalendarCheck,
  },
];

export function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="An overview of your employee workspace."
      />

      <div className="stats-grid">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="dashboard-grid">
        <Card>
          <div className="section-heading">
            <div>
              <h2>Welcome to Dexa HR</h2>
              <p>Your employee and attendance workspace.</p>
            </div>
          </div>

          <p className="muted-copy">
            Manage employee information, monitor daily attendance,
            and respond to profile updates from one place.
          </p>

          <div className="quick-links">
            <Link to="/employees" className="quick-link">
              <div className="quick-link-icon">
                <Users size={19} />
              </div>
              <div>
                <strong>Manage employees</strong>
                <span>View and maintain employee records</span>
              </div>
              <ArrowRight size={17} />
            </Link>

            <Link to="/attendance" className="quick-link">
              <div className="quick-link-icon">
                <CalendarCheck size={19} />
              </div>
              <div>
                <strong>Monitor attendance</strong>
                <span>Review check-in and check-out records</span>
              </div>
              <ArrowRight size={17} />
            </Link>
          </div>
        </Card>

        <Card>
          <div className="section-heading">
            <div>
              <h2>System status</h2>
              <p>Dashboard setup progress</p>
            </div>
            <span className="status-badge">
              <span className="status-dot" />
              UI ready
            </span>
          </div>

          <div className="status-list">
            <div>
              <span>Dashboard layout</span>
              <strong>Ready</strong>
            </div>
            <div>
              <span>Employee API</span>
              <strong className="text-muted">Next step</strong>
            </div>
            <div>
              <span>Live notifications</span>
              <strong className="text-muted">Next step</strong>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
