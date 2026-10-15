import { useState } from 'react';
import type { FormEvent } from 'react';
import { BriefcaseBusiness, LockKeyhole, Mail } from 'lucide-react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import { Button } from '../components/ui/Button';

export function LoginPage() {
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [companyEmail, setCompanyEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            await login(companyEmail.trim(), password);

            const from = location.state?.from;
            const destination =
                typeof from === 'string' &&
                    from.startsWith('/') &&
                    !from.startsWith('//') &&
                    !from.includes('\\')
                    ? from
                    : '/';

            navigate(destination, { replace: true });
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Unable to sign in. Please try again.',
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className="login-page">
            <section className="login-card">
                <div className="login-brand">
                    <div className="brand-mark">
                        <BriefcaseBusiness size={22} />
                    </div>
                    <span>Dexa <strong>HR</strong></span>
                </div>

                <div className="login-heading">
                    <h1>Welcome back</h1>
                    <p>Sign in with your company account to continue.</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <label htmlFor="companyEmail">Company email</label>
                    <div className="login-input-wrap">
                        <Mail size={18} />
                        <input
                            id="companyEmail"
                            type="email"
                            autoComplete="username"
                            placeholder="you@company.com"
                            value={companyEmail}
                            onChange={(event) => setCompanyEmail(event.target.value)}
                            required
                        />
                    </div>

                    <label htmlFor="password">Password</label>
                    <div className="login-input-wrap">
                        <LockKeyhole size={18} />
                        <input
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required
                        />
                    </div>

                    {error && (
                        <div className="login-error" role="alert">
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="login-submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Signing in…' : 'Sign in'}
                    </Button>
                </form>

                <p className="login-footer">
                    Restricted to authorized HR personnel.
                </p>
            </section>
        </main>
    );
}
