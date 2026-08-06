import { useState, type FormEvent } from 'react';
import type { AuthPayload, SignupPayload } from '../../types';

interface AuthPanelProps {
    mode: 'login' | 'signup';
    onSwitch: () => void;
    onSubmit: (payload: AuthPayload | SignupPayload) => Promise<void> | void;
    isLoading: boolean;
    error?: string;
}

const initialForm = {
    username: '',
    email: '',
    password: '',
};

export function AuthPanel({ mode, onSwitch, onSubmit, isLoading, error }: AuthPanelProps) {
    const [form, setForm] = useState(initialForm);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (mode === 'signup') {
            await onSubmit({
                username: form.username.trim(),
                email: form.email.trim(),
                password: form.password,
            });
            return;
        }

        await onSubmit({
            email: form.email.trim(),
            password: form.password,
        });
    };

    return (
        <div className="auth-card">
            <div className="auth-card__header">
                <p className="eyebrow">MVP Chat</p>
                <h1>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
                <p>Simple, clean chat access connected to the backend.</p>
            </div>

            <form className="form-stack" onSubmit={handleSubmit}>
                {mode === 'signup' && (
                    <label className="field">
                        <span>Username</span>
                        <input
                            value={form.username}
                            onChange={(event) => setForm({ ...form, username: event.target.value })}
                            placeholder="Choose a username"
                            required
                        />
                    </label>
                )}

                <label className="field">
                    <span>Email</span>
                    <input
                        type="email"
                        value={form.email}
                        onChange={(event) => setForm({ ...form, email: event.target.value })}
                        placeholder="your@email.com"
                        required
                    />
                </label>

                <label className="field">
                    <span>Password</span>
                    <input
                        type="password"
                        value={form.password}
                        onChange={(event) => setForm({ ...form, password: event.target.value })}
                        placeholder="At least 8 characters"
                        required
                        minLength={8}
                    />
                </label>

                {error ? <p className="form-error">{error}</p> : null}

                <button className="primary-btn" type="submit" disabled={isLoading}>
                    {isLoading ? 'Working...' : mode === 'login' ? 'Log in' : 'Sign up'}
                </button>
            </form>

            <button className="text-btn" type="button" onClick={onSwitch}>
                {mode === 'login' ? 'Need an account? Create one' : 'Already have one? Log in'}
            </button>
        </div>
    );
}

export default AuthPanel;
