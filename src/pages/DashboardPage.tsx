import { useCallback, useEffect, useState } from 'react';
import {
  Users,
  CalendarCheck,
  Clock3,
  UserCheck,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/ui/PageHeader';
import { StatCard } from '../components/ui/StatCard';
import { Card } from '../components/ui/Card';
import { getEmployees } from '../services/employees';
import { getAttendanceOverview } from '../services/attendance';
import type { AttendanceRecord } from '../types/attendance';

interface DashboardData {
  employeeCount: number;
  checkedOutCount: number;
  presentCount: number;
  lateCount: number;
  recentAttendance: AttendanceRecord[];
}

function getJakartaDate(): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );

  return `${values.year}-${values.month}-${values.day}`;
}

function formatTime(value: string | null): string {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

function formatStatus(status: string | null): string {
  if (!status) return '—';

  return status.replaceAll('_', ' ').toLowerCase().replace(
    /^\w/,
    (letter) => letter.toUpperCase(),
  );
}

async function loadDashboardData(): Promise<DashboardData> {
  const today = getJakartaDate();

  const [employees, firstPage] = await Promise.all([
    getEmployees(),
    getAttendanceOverview({
      from: today,
      to: today,
      page: 1,
      limit: 100,
    }),
  ]);

  // Fetch remaining pages so today's summary uses all records,
  // not only the first page.
  const remainingPages = Array.from(
    { length: Math.max(0, firstPage.totalPages - 1) },
    (_, index) => index + 2,
  );

  const otherPages = await Promise.all(
    remainingPages.map((page) =>
      getAttendanceOverview({
        from: today,
        to: today,
        page,
        limit: 100,
      }),
    ),
  );

  const records = [
    ...firstPage.data,
    ...otherPages.flatMap((page) => page.data),
  ];

  const presentEmployeeIds = new Set(
    records
      .filter((record) => record.checkInAt !== null)
      .map((record) => record.employeeId),
  );

  const checkedOutCount = records.filter(
    (record) => record.checkOutAt !== null,
  ).length;

  const lateCount = records.filter(
    (record) => record.checkInStatus === 'LATE',
  ).length;

  const recentAttendance = [...records]
    .sort((a, b) => {
      const aTime = a.checkInAt ?? a.createdAt;
      const bTime = b.checkInAt ?? b.createdAt;

      return new Date(bTime).getTime() - new Date(aTime).getTime();
    })
    .slice(0, 5);

  return {
    employeeCount: employees.length,
    checkedOutCount,
    presentCount: presentEmployeeIds.size,
    lateCount,
    recentAttendance,
  };
}

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await loadDashboardData();
      setData(result);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Could not load dashboard data.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const stats = [
    {
      label: 'Total employees',
      value: data ? String(data.employeeCount) : '—',
      description: 'Employee directory',
      icon: Users,
    },
    {
      label: 'Present today',
      value: data ? String(data.presentCount) : '—',
      description: 'Employees checked in today',
      icon: UserCheck,
    },
    {
      label: 'Late arrivals',
      value: data ? String(data.lateCount) : '—',
      description: 'Late check-ins today',
      icon: Clock3,
    },
    {
      label: 'Checked out today',
      value: data ? String(data.checkedOutCount) : '—',
      description: "Today's completed check-outs",
      icon: CalendarCheck,
    },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="An overview of your employee workspace."
      />

      <div className="dashboard-toolbar">
        <span className="muted-copy">
          {`Attendance overview · ${getJakartaDate()}`}
        </span>
        <button
          type="button"
          className="dashboard-refresh-button"
          onClick={() => void refresh()}
          disabled={isLoading}
        >
          <RefreshCw size={15} className={isLoading ? 'is-spinning' : ''} />
          {isLoading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="dashboard-error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => void refresh()}>
            Try again
          </button>
        </div>
      )}

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
            and review employee profile updates from one place.
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
              <p>Current dashboard data</p>
            </div>
            <span className={`status-badge ${error ? 'is-error' : ''}`}>
              <span className="status-dot" />
              {error ? 'Data unavailable' : isLoading ? 'Loading' : 'Connected'}
            </span>
          </div>

          <div className="status-list">
            <div>
              <span>Employee records</span>
              <strong>{data ? 'Loaded' : isLoading ? 'Loading' : 'Unavailable'}</strong>
            </div>
            <div>
              <span>Today's attendance</span>
              <strong>{data ? 'Loaded' : isLoading ? 'Loading' : 'Unavailable'}</strong>
            </div>
            <div>
              <span>Live notifications</span>
              <strong>Available in notification center</strong>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="section-heading">
          <div>
            <h2>Recent attendance</h2>
            <p>Latest attendance records for today (Jakarta time).</p>
          </div>
          <Link to="/attendance" className="dashboard-view-all">
            View all <ArrowRight size={15} />
          </Link>
        </div>

        {isLoading && !data ? (
          <p className="muted-copy">Loading attendance records…</p>
        ) : data?.recentAttendance.length ? (
          <div className="dashboard-table-wrapper">
            <table className="dashboard-attendance-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Check in</th>
                  <th>Check out</th>
                  <th>Check-in status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentAttendance.map((record) => (
                  <tr key={record.id}>
                    <td>
                      <strong>{record.employee.fullName}</strong>
                      <span>{record.employee.companyEmail}</span>
                    </td>
                    <td>{formatTime(record.checkInAt)}</td>
                    <td>{formatTime(record.checkOutAt)}</td>
                    <td>{formatStatus(record.checkInStatus)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="dashboard-table-empty">
            <CalendarCheck size={24} />
            <strong>No attendance records today</strong>
            <span>Records will appear here after employees check in.</span>
          </div>
        )}
      </Card>
    </>
  );
}