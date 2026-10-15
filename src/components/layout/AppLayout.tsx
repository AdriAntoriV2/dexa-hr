import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Bell, Menu, Search, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Sidebar } from './Sidebar';


export function AppLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, logout } = useAuth();
    return (
        <div className="app-shell">
            <Sidebar
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div className="app-main">
                <header className="topbar">
                    <button
                        className="icon-button mobile-menu"
                        aria-label="Open navigation"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu size={20} />
                    </button>

                    <div className="topbar-search">
                        <Search size={17} />
                        <span>HR Workspace</span>
                    </div>

                    <div className="topbar-actions">
                        <button
                            className="icon-button"
                            aria-label="Notifications"
                            title="Notifications will be connected later"
                        >
                            <Bell size={19} />
                        </button>

                        <div className="topbar-divider" />

                        <div className="user-avatar">
                            {user?.fullName
                                ?.split(' ')
                                .slice(0, 2)
                                .map((part) => part[0])
                                .join('')
                                .toUpperCase() || 'HR'}
                        </div>

                        <div className="user-info">
                            <strong>{user?.fullName ?? 'HR Administrator'}</strong>
                            <span>{user?.companyEmail ?? 'Human Resources'}</span>
                        </div>

                        <button
                            className="icon-button"
                            aria-label="Sign out"
                            title="Sign out"
                            onClick={logout}
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </header>

                <main className="page-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
