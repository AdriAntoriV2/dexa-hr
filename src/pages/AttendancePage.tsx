import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Clock3,
    RefreshCw,
    Search,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { getAttendanceOverview } from '../services/attendance';
import type {
    AttendanceRecord,
    AttendanceTimingStatus,
} from '../types/attendance';
import { EmployeeAvatar } from '../components/ui/EmployeeAvatar'

const PAGE_SIZE = 10;

function getTodayJakarta(): string {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Jakarta',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(new Date());
}

function getMonthStartJakarta(): string {
    const today = getTodayJakarta();
    return `${today.slice(0, 7)}-01`;
}

function formatTime(value: string | null): string {
    if (!value) return '—';

    return new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).format(new Date(value));
}

function formatDate(value: string): string {
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day, 12));

    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
    }).format(date);
}

function getStatusClass(status: AttendanceTimingStatus | null) {
    if (!status) return 'attendance-status attendance-status-pending';

    return `attendance-status attendance-status-${status.toLowerCase()}`;
}

function StatusBadge({
    status,
}: {
    status: AttendanceTimingStatus | null;
}) {
    return (
        <span className={getStatusClass(status)}>
            {status ? status.replace('_', ' ') : 'Pending'}
        </span>
    );
}

export function AttendancePage() {
    const today = getTodayJakarta();
    const monthStart = getMonthStartJakarta();

    const [from, setFrom] = useState(monthStart);
    const [to, setTo] = useState(today);

    const [draftFrom, setDraftFrom] = useState(monthStart);
    const [draftTo, setDraftTo] = useState(today);
    const [filterError, setFilterError] = useState('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadAttendance = useCallback(async () => {
        try {
            const result = await getAttendanceOverview({
                from: from || undefined,
                to: to || undefined,
                page,
                limit: PAGE_SIZE,
            });

            setRecords(result.data);
            setTotal(result.total);
            setTotalPages(result.totalPages);
            setError('');
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Unable to load attendance records.',
            );
        } finally {
            setLoading(false);
        }
    }, [from, to, page]);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            void loadAttendance();
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [loadAttendance]);

    const filteredRecords = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return records;

        return records.filter((record) =>
            [
                record.employee.fullName,
                record.employee.companyEmail,
            ].some((value) => value.toLowerCase().includes(term)),
        );
    }, [records, search]);

    const dateRangeInvalid = Boolean(from && to && from > to);

    const applyDateRange = () => {
        if (draftFrom && draftTo && draftFrom > draftTo) {
            setFilterError('Start date cannot be later than end date.');
            return;
        }

        setFilterError('');
        setPage(1);
        setFrom(draftFrom);
        setTo(draftTo);
    };

    return (
        <div className="page-content attendance-page">
            <PageHeader
                title="Attendance"
                description="Review employee attendance and punctuality."
            />

            <div className="attendance-summary-grid">
                <Card>
                    <div className="attendance-summary-icon">
                        <CalendarDays size={19} />
                    </div>
                    <span className="attendance-summary-label">Matching records</span>
                    <strong className="attendance-summary-value">
                        {loading ? '—' : total}
                    </strong>
                    <span className="attendance-summary-caption">
                        For the selected date range
                    </span>
                </Card>
                <Card>
                    <div className="attendance-summary-icon">
                        <Clock3 size={19} />
                    </div>
                    <span className="attendance-summary-label">Current page</span>
                    <strong className="attendance-summary-value">
                        {loading ? '—' : `${records.length} / ${PAGE_SIZE}`}
                    </strong>
                    <span className="attendance-summary-caption">
                        Records displayed on this page
                    </span>
                </Card>
            </div>

            <Card>
                <div className="attendance-toolbar">
                    <div className="attendance-filter-group">
                        <label>
                            From
                            <input
                                type="date"
                                value={draftFrom}
                                max={draftTo || undefined}
                                onChange={(event) => setDraftFrom(event.target.value)}
                            />
                        </label>
                        <label>
                            To
                            <input
                                type="date"
                                value={draftTo}
                                min={draftFrom || undefined}
                                max={getTodayJakarta()}
                                onChange={(event) => setDraftTo(event.target.value)}
                            />
                        </label>
                        <Button onClick={applyDateRange}>
                            Apply filters
                        </Button>
                    </div>

                    <div className="attendance-search">
                        <Search size={17} />
                        <input
                            type="search"
                            placeholder="Search employees..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            aria-label="Search employees"
                        />
                    </div>

                    <Button
                        variant="secondary"
                        onClick={() => void loadAttendance()}
                        disabled={loading}
                    >
                        <RefreshCw size={15} />
                        Refresh
                    </Button>
                </div>

                {dateRangeInvalid && (
                    <p className="attendance-error">
                        The start date must be on or before the end date.
                    </p>
                )}

                {filterError && (
                    <p className="attendance-error">{filterError}</p>
                )}

                {error && (
                    <div className="attendance-error-panel" role="alert">
                        <p>{error}</p>
                        <Button variant="secondary" onClick={() => void loadAttendance()}>
                            Try again
                        </Button>
                    </div>
                )}

                <div className="attendance-table-wrap">
                    <table className="attendance-table">
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Date</th>
                                <th>Check in</th>
                                <th>Check-in status</th>
                                <th>Check out</th>
                                <th>Check-out status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="attendance-table-message">
                                        Loading attendance records…
                                    </td>
                                </tr>
                            ) : error ? null : filteredRecords.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="attendance-table-message">
                                        {search
                                            ? 'No records match your search on this page.'
                                            : 'No attendance records found for this date range.'}
                                    </td>
                                </tr>
                            ) : (
                                filteredRecords.map((record) => (
                                    <tr key={record.id}>
                                        <td>
                                            <div className="attendance-employee">
                                                <EmployeeAvatar
                                                    fullName={record.employee.fullName}
                                                    photoUrl={record.employee.photoUrl}
                                                    className="attendance-employee-avatar"
                                                />
                                                <div>
                                                    <strong>{record.employee.fullName}</strong>
                                                    <span>{record.employee.companyEmail}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{formatDate(record.attendanceDate)}</td>
                                        <td>{formatTime(record.checkInAt)}</td>
                                        <td>
                                            <StatusBadge status={record.checkInStatus} />
                                        </td>
                                        <td>{formatTime(record.checkOutAt)}</td>
                                        <td>
                                            <StatusBadge status={record.checkOutStatus} />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="attendance-pagination">
                    <span>
                        {total === 0
                            ? 'No records'
                            : `Page ${page} of ${Math.max(totalPages, 1)} · ${total} records`}
                    </span>
                    <div>
                        <Button
                            variant="secondary"
                            disabled={loading || page <= 1}
                            onClick={() => setPage((current) => Math.max(1, current - 1))}
                        >
                            <ChevronLeft size={16} />
                            Previous
                        </Button>
                        <Button
                            variant="secondary"
                            disabled={loading || page >= totalPages || totalPages === 0}
                            onClick={() => setPage((current) => current + 1)}
                        >
                            Next
                            <ChevronRight size={16} />
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}