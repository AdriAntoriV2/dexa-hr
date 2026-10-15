import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import {
    AlertCircle,
    BriefcaseBusiness,
    Mail,
    Pencil,
    Plus,
    RefreshCw,
    Search,
    Users,
    X,
} from 'lucide-react';
import {
    createEmployee,
    getEmployees,
    updateEmployee,
} from '../services/employees';
import type {
    CreateEmployeePayload,
    Employee,
    UpdateEmployeePayload,
} from '../types/employee';
import { EmployeeAvatar } from '../components/ui/EmployeeAvatar';

type EmployeeForm = {
    fullName: string;
    companyEmail: string;
    position: string;
    phoneNumber: string;
    password: string;
};

const emptyForm: EmployeeForm = {
    fullName: '',
    companyEmail: '',
    position: '',
    phoneNumber: '',
    password: '',
};

export function EmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [pageError, setPageError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [form, setForm] = useState<EmployeeForm>(emptyForm);
    const [formError, setFormError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const loadEmployees = useCallback(async () => {
        setIsLoading(true);
        setPageError('');

        try {
            const result = await getEmployees();
            setEmployees(result);
        } catch (error) {
            setPageError(
                error instanceof Error ? error.message : 'Unable to load employees.',
            );
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadEmployees();
    }, [loadEmployees]);

    const filteredEmployees = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) return employees;

        return employees.filter((employee) =>
            [employee.fullName, employee.companyEmail, employee.position]
                .some((value) => value.toLowerCase().includes(query)),
        );
    }, [employees, search]);

    function openCreateModal() {
        setEditingEmployee(null);
        setForm(emptyForm);
        setFormError('');
        setIsModalOpen(true);
    }

    function openEditModal(employee: Employee) {
        setEditingEmployee(employee);
        setForm({
            fullName: employee.fullName,
            companyEmail: employee.companyEmail,
            position: employee.position,
            phoneNumber: employee.phoneNumber ?? '',
            password: '',
        });
        setFormError('');
        setIsModalOpen(true);
    }

    function closeModal() {
        if (isSaving) return;
        setIsModalOpen(false);
        setEditingEmployee(null);
        setForm(emptyForm);
        setFormError('');
    }

    function updateForm(field: keyof EmployeeForm, value: string) {
        setForm((current) => ({ ...current, [field]: value }));
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setFormError('');

        const fullName = form.fullName.trim();
        const companyEmail = form.companyEmail.trim().toLowerCase();
        const position = form.position.trim();
        const phoneNumber = form.phoneNumber.trim();

        if (!fullName || !companyEmail || !position) {
            setFormError('Name, company email, and position are required.');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(companyEmail)) {
            setFormError('Enter a valid company email address.');
            return;
        }

        if (!editingEmployee && form.password.length < 8) {
            setFormError('The initial password must be at least 8 characters.');
            return;
        }

        setIsSaving(true);

        try {
            if (editingEmployee) {
                const payload: UpdateEmployeePayload = {
                    fullName,
                    companyEmail,
                    position,
                    phoneNumber: phoneNumber || null,
                };

                const updated = await updateEmployee(editingEmployee.id, payload);
                setEmployees((current) =>
                    current.map((employee) =>
                        employee.id === updated.id ? updated : employee,
                    ),
                );
            } else {
                const payload: CreateEmployeePayload = {
                    fullName,
                    companyEmail,
                    position,
                    password: form.password,
                    ...(phoneNumber ? { phoneNumber } : {}),
                };

                const created = await createEmployee(payload);
                setEmployees((current) => [created, ...current]);
            }

            setIsModalOpen(false);
            setEditingEmployee(null);
            setForm(emptyForm);
        } catch (error) {
            setFormError(
                error instanceof Error ? error.message : 'Unable to save employee.',
            );
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <section className="employees-page">
            <div className="employees-heading">
                <div>
                    <p className="page-eyebrow">PEOPLE MANAGEMENT</p>
                    <h1>Employees</h1>
                    <p className="employees-subtitle">
                        Manage company profiles and onboard new employees.
                    </p>
                </div>
                <button className="button button-primary" onClick={openCreateModal}>
                    <Plus size={17} />
                    Add employee
                </button>
            </div>

            <div className="employee-summary">
                <div className="employee-summary-icon">
                    <Users size={21} />
                </div>
                <div>
                    <span className="employee-summary-label">Total accounts</span>
                    <strong>{employees.length}</strong>
                </div>
                <span className="employee-summary-note">
                    {employees.filter((employee) => employee.role === 'EMPLOYEE').length}
                    {' '}employees · {' '}
                    {employees.filter((employee) => employee.role === 'HR').length} HR
                </span>
            </div>

            <div className="employee-directory">
                <div className="employee-directory-toolbar">
                    <div>
                        <h2>Directory</h2>
                        <p>View and update employee information.</p>
                    </div>
                    <div className="employee-toolbar-actions">
                        <label className="employee-search">
                            <Search size={17} />
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search name, email, position..."
                                aria-label="Search employees"
                            />
                            {search && (
                                <button
                                    type="button"
                                    className="icon-button"
                                    onClick={() => setSearch('')}
                                    aria-label="Clear search"
                                >
                                    <X size={15} />
                                </button>
                            )}
                        </label>
                        <button
                            type="button"
                            className="button button-secondary refresh-button"
                            onClick={() => void loadEmployees()}
                            disabled={isLoading}
                            aria-label="Refresh employee list"
                        >
                            <RefreshCw size={16} />
                            Refresh
                        </button>
                    </div>
                </div>

                {pageError && (
                    <div className="employee-alert employee-alert-error" role="alert">
                        <AlertCircle size={18} />
                        <span>{pageError}</span>
                        <button
                            type="button"
                            className="button button-secondary"
                            onClick={() => void loadEmployees()}
                        >
                            Try again
                        </button>
                    </div>
                )}

                {isLoading ? (
                    <div className="employee-state">Loading employee directory...</div>
                ) : !pageError && filteredEmployees.length === 0 ? (
                    <div className="employee-state">
                        <Users size={28} />
                        <strong>
                            {search ? 'No matching employees' : 'No employees yet'}
                        </strong>
                        <span>
                            {search
                                ? 'Try a different name, email, or position.'
                                : 'Add an employee to get started.'}
                        </span>
                    </div>
                ) : !pageError ? (
                    <div className="employee-table-wrap">
                        <table className="employee-table">
                            <thead>
                                <tr>
                                    <th>Employee</th>
                                    <th>Position</th>
                                    <th>Phone</th>
                                    <th>Role</th>
                                    <th className="employee-actions-heading">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEmployees.map((employee) => (
                                    <tr key={employee.id}>
                                        <td>
                                            <div className="employee-identity">
                                                <EmployeeAvatar
                                                    fullName={employee.fullName}
                                                    photoUrl={employee.photoUrl}
                                                />
                                                <div className="employee-identity-copy">
                                                    <strong>{employee.fullName}</strong>
                                                    <span>{employee.companyEmail}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="employee-position">
                                                <BriefcaseBusiness size={15} />
                                                {employee.position}
                                            </span>
                                        </td>
                                        <td>{employee.phoneNumber || '—'}</td>
                                        <td>
                                            <span
                                                className={`role-badge ${employee.role === 'HR' ? 'role-badge-hr' : ''
                                                    }`}
                                            >
                                                {employee.role === 'HR' ? 'HR' : 'Employee'}
                                            </span>
                                        </td>
                                        <td className="employee-actions-cell">
                                            <button
                                                type="button"
                                                className="button button-secondary edit-employee-button"
                                                onClick={() => openEditModal(employee)}
                                            >
                                                <Pencil size={15} />
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : null}

                {!isLoading && !pageError && (
                    <div className="employee-directory-footer">
                        Showing {filteredEmployees.length} of {employees.length} accounts
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div
                    className="employee-modal-backdrop"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) closeModal();
                    }}
                >
                    <section
                        className="employee-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="employee-modal-title"
                    >
                        <div className="employee-modal-heading">
                            <div>
                                <p className="page-eyebrow">
                                    {editingEmployee ? 'EMPLOYEE PROFILE' : 'NEW ACCOUNT'}
                                </p>
                                <h2 id="employee-modal-title">
                                    {editingEmployee ? 'Edit employee' : 'Add employee'}
                                </h2>
                                <p>
                                    {editingEmployee
                                        ? 'Update this employee’s company information.'
                                        : 'Create an employee account and set their initial password.'}
                                </p>
                            </div>
                            <button
                                type="button"
                                className="icon-button modal-close"
                                onClick={closeModal}
                                disabled={isSaving}
                                aria-label="Close dialog"
                            >
                                <X size={19} />
                            </button>
                        </div>

                        <form className="employee-form" onSubmit={handleSubmit}>
                            <label className="employee-form-field">
                                <span>Full name <b>*</b></span>
                                <input
                                    value={form.fullName}
                                    onChange={(event) => updateForm('fullName', event.target.value)}
                                    autoComplete="name"
                                    maxLength={120}
                                    required
                                />
                            </label>

                            <label className="employee-form-field">
                                <span>Company email <b>*</b></span>
                                <div className="employee-input-with-icon">
                                    <Mail size={16} />
                                    <input
                                        type="email"
                                        value={form.companyEmail}
                                        onChange={(event) =>
                                            updateForm('companyEmail', event.target.value)
                                        }
                                        autoComplete="email"
                                        maxLength={254}
                                        required
                                    />
                                </div>
                            </label>

                            <label className="employee-form-field">
                                <span>Position <b>*</b></span>
                                <input
                                    value={form.position}
                                    onChange={(event) => updateForm('position', event.target.value)}
                                    maxLength={120}
                                    required
                                />
                            </label>

                            <label className="employee-form-field">
                                <span>Phone number</span>
                                <input
                                    type="tel"
                                    value={form.phoneNumber}
                                    onChange={(event) =>
                                        updateForm('phoneNumber', event.target.value)
                                    }
                                    autoComplete="tel"
                                    maxLength={30}
                                    placeholder="+62..."
                                />
                            </label>

                            {!editingEmployee && (
                                <label className="employee-form-field">
                                    <span>Initial password <b>*</b></span>
                                    <input
                                        type="password"
                                        value={form.password}
                                        onChange={(event) =>
                                            updateForm('password', event.target.value)
                                        }
                                        autoComplete="new-password"
                                        minLength={8}
                                        maxLength={128}
                                        required
                                    />
                                    <small>Use at least 8 characters.</small>
                                </label>
                            )}

                            {formError && (
                                <div className="employee-alert employee-alert-error" role="alert">
                                    <AlertCircle size={17} />
                                    {formError}
                                </div>
                            )}

                            <div className="employee-form-footer">
                                <button
                                    type="button"
                                    className="button button-secondary"
                                    onClick={closeModal}
                                    disabled={isSaving}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="button button-primary"
                                    disabled={isSaving}
                                >
                                    {isSaving
                                        ? 'Saving...'
                                        : editingEmployee
                                            ? 'Save changes'
                                            : 'Create employee'}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}
        </section>
    );
}