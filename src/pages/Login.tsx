import {type FormEvent, useState } from 'react';
import { CheckCircle2, Eye, EyeOff, KeyRound, LayoutGrid, Lock, Mail, User } from 'lucide-react';import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';
import { extractErrorMessage } from '@/api/client';
import ErrorBanner from '@/components/ErrorBanner';
import type {Role} from '@/types';

const PASSWORD_HINT =
    'At least 8 characters, with an uppercase letter, a lowercase letter and a digit.';

interface LoginLocationState{
    from?: {pathname: string};
}

export default function Login() {

    const{ login, register} = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const location = useLocation();


    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    const [registerRole, setRegisterRole] = useState<Extract<Role, 'USER' | 'DEVELOPER'>>('USER');
    const [regUsername, setRegUsername] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [showRegPassword, setShowRegPassword] = useState(false);

    const goHomeAfterAuth = () => {
        const state = location.state as LoginLocationState | undefined;
        navigate(state?.from?.pathname ?? '/', {replace:true});
    };

    const handleLoginSubmit = async (e : FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try{
            await login(loginEmail, loginPassword);
            goHomeAfterAuth();
        }catch (err){
            setError(extractErrorMessage(err, 'Invalid credentials. '));
        }finally {
            setLoading(false);
        }
    };


    const handleRegisterSubmit = async (e : FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try{
            await register({
                email: regEmail,
                username: regUsername,
                password : regPassword,
                role: registerRole
            });
            goHomeAfterAuth();
        }catch (err){
            setError(extractErrorMessage(err, 'Could not create your account. '));
        }finally {
            setLoading(false);
        }
    }

    return (
        <div className="w-full flex justify-center items-center py-6">
            <div className="max-w-4xl w-full bg-surface-container-lowest rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.04)] flex flex-col md:flex-row overflow-hidden border border-outline-variant/30">
                <div className="hidden md:flex md:w-5/12 bg-surface-container-low p-8 flex-col justify-between border-r border-outline-variant/30 relative overflow-hidden">
                    <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary-container rounded-full blur-[80px] opacity-30 pointer-events-none" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-8">
                            <LayoutGrid className="w-6 h-6 text-primary stroke-[2.5]" />
                            <span className="font-headline text-lg font-bold text-primary">Applivo</span>
                        </div>
                        <h1 className="font-headline text-2xl lg:text-3xl font-extrabold text-on-surface leading-tight mb-4 mt-8">
                            Experience apps without borders.
                        </h1>
                        <p className="font-sans text-sm text-on-surface-variant leading-relaxed">
                            Upload, test, and showcase Android applications directly in your browser via a
                            live, sandboxed emulator session.
                        </p>
                    </div>
                    <div className="relative z-10 pt-6 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center border border-outline-variant/40">
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-label text-xs font-bold text-on-surface uppercase tracking-wider">
                                Trusted emulation
                            </p>
                            <p className="font-sans text-[11px] text-on-surface-variant">
                                Secure, isolated Docker containers per session.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="w-full md:w-7/12 p-8 md:p-12 flex flex-col justify-center">
                    <div className="md:hidden flex items-center justify-center gap-2 mb-8">
                        <LayoutGrid className="w-6 h-6 text-primary stroke-[2.5]" />
                        <span className="font-headline text-lg font-bold text-primary">Applivo</span>
                    </div>

                    <div className="flex gap-6 border-b border-outline-variant/50 mb-8">
                        <button
                            onClick={() => {
                                setActiveTab('login');
                                setError(null);
                            }}
                            className={`pb-3 font-label text-sm font-bold border-b-2 transition-all ${
                                activeTab === 'login'
                                    ? 'text-primary border-primary'
                                    : 'text-on-surface-variant border-transparent hover:text-primary'
                            }`}
                        >
                            Log in
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab('register');
                                setError(null);
                            }}
                            className={`pb-3 font-label text-sm font-bold border-b-2 transition-all ${
                                activeTab === 'register'
                                    ? 'text-primary border-primary'
                                    : 'text-on-surface-variant border-transparent hover:text-primary'
                            }`}
                        >
                            Create account
                        </button>
                    </div>

                    {error && (
                        <div className="mb-5">
                            <ErrorBanner message={error} />
                        </div>
                    )}

                    {activeTab === 'login' ? (
                        <form onSubmit={handleLoginSubmit} className="flex flex-col gap-5">
                            <div>
                                <label className="block font-label text-xs font-bold text-on-surface mb-2 uppercase tracking-wider">
                                    Email address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
                                    <input
                                        type="email"
                                        required
                                        value={loginEmail}
                                        onChange={(e) => setLoginEmail(e.target.value)}
                                        placeholder="name@company.com"
                                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg pl-10 pr-4 py-2.5 font-sans text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-label text-xs font-bold text-on-surface mb-2 uppercase tracking-wider">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
                                    <input
                                        type={showLoginPassword ? 'text' : 'password'}
                                        required
                                        value={loginPassword}
                                        onChange={(e) => setLoginPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg pl-10 pr-10 py-2.5 font-sans text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowLoginPassword((prev) => !prev)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface-variant"
                                        tabIndex={-1}
                                    >
                                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary text-on-primary font-label text-sm font-bold py-3 rounded-lg mt-2 hover:opacity-90 transition-all disabled:opacity-60"
                            >
                                {loading ? 'Signing in…' : 'Sign in'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-5">
                            <div>
                                <label className="block font-label text-xs font-bold text-on-surface mb-3 uppercase tracking-wider">
                                    I want to...
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setRegisterRole('USER')}
                                        className={`p-4 rounded-xl border transition-all flex flex-col items-center text-center gap-2 relative ${
                                            registerRole === 'USER'
                                                ? 'border-primary bg-primary-container/20'
                                                : 'border-outline-variant bg-surface-container-low hover:bg-surface-container'
                                        }`}
                                    >
                                        <User className={`w-5 h-5 ${registerRole === 'USER' ? 'text-primary' : 'text-tertiary'}`} />
                                        <span className="font-headline text-xs font-bold text-on-surface">Explore apps</span>
                                        <span className="font-sans text-[10px] text-on-surface-variant">Try live demos</span>
                                        {registerRole === 'USER' && (
                                            <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-primary" />
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setRegisterRole('DEVELOPER')}
                                        className={`p-4 rounded-xl border transition-all flex flex-col items-center text-center gap-2 relative ${
                                            registerRole === 'DEVELOPER'
                                                ? 'border-primary bg-primary-container/20'
                                                : 'border-outline-variant bg-surface-container-low hover:bg-surface-container'
                                        }`}
                                    >
                                        <KeyRound
                                            className={`w-5 h-5 ${registerRole === 'DEVELOPER' ? 'text-primary' : 'text-tertiary'}`}
                                        />
                                        <span className="font-headline text-xs font-bold text-on-surface">Upload APKs</span>
                                        <span className="font-sans text-[10px] text-on-surface-variant">Publish demos</span>
                                        {registerRole === 'DEVELOPER' && (
                                            <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-primary" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block font-label text-xs font-bold text-on-surface mb-2 uppercase tracking-wider">
                                    Username
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
                                    <input
                                        type="text"
                                        required
                                        minLength={3}
                                        maxLength={50}
                                        pattern="[A-Za-z0-9_]+"
                                        title="Letters, numbers and underscores only"
                                        value={regUsername}
                                        onChange={(e) => setRegUsername(e.target.value)}
                                        placeholder="johndoe"
                                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg pl-10 pr-4 py-2.5 font-sans text-sm focus:outline-none focus:border-primary"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-label text-xs font-bold text-on-surface mb-2 uppercase tracking-wider">
                                    Email address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
                                    <input
                                        type="email"
                                        required
                                        value={regEmail}
                                        onChange={(e) => setRegEmail(e.target.value)}
                                        placeholder="name@company.com"
                                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg pl-10 pr-4 py-2.5 font-sans text-sm focus:outline-none focus:border-primary"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-label text-xs font-bold text-on-surface mb-2 uppercase tracking-wider">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
                                    <input
                                        type={showRegPassword ? 'text' : 'password'}
                                        required
                                        minLength={8}
                                        maxLength={100}
                                        pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$"
                                        title={PASSWORD_HINT}
                                        value={regPassword}
                                        onChange={(e) => setRegPassword(e.target.value)}
                                        placeholder="Create a secure password"
                                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg pl-10 pr-10 py-2.5 font-sans text-sm focus:outline-none focus:border-primary"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowRegPassword((prev) => !prev)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface-variant"
                                        tabIndex={-1}
                                    >
                                        {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                <p className="text-[10px] text-tertiary mt-1">{PASSWORD_HINT}</p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary text-on-primary font-label text-sm font-bold py-3 rounded-lg mt-2 hover:opacity-90 transition-colors disabled:opacity-60"
                            >
                                {loading ? 'Creating account…' : 'Create account'}
                            </button>
                        </form>
                    )}

                    <p className="mt-6 text-center font-sans text-xs text-on-surface-variant">
                        <Link to="/" className="text-primary font-bold hover:underline">
                            Continue browsing without an account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
