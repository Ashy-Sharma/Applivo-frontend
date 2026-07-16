import {useAuth} from "@/auth/AuthContext.tsx";
import { LayoutGrid, LogOut, Search, Upload } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {type FormEvent, useState} from "react";

export default function Header(){
    const {user, isAuthenticated, hasRole, logout} = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [query, setQuery] = useState(searchParams.get('q') ?? '');

    const handleSearchSubmit = (e: FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (query.trim()){
            params.set('q', query.trim());
            navigate(`/?${params.toString()}`);
        }
    };

    return(
        <header className="bg-background border-b border-outline-variant w-full sticky top-0 z-50">
            <div className="flex justify-between items-center w-full px-4 md:px-10 max-w-[1280px] mx-auto h-16 gap-4">
                <div className="flex items-center gap-8 shrink-0">
                    <Link
                        to="/"
                        className="flex items-center gap-2 font-headline text-2xl font-bold text-primary hover:opacity-90 transition-opacity"
                    >
                        <LayoutGrid className="w-7 h-7 text-primary stroke-[2.5]" />
                        <span>Applivo</span>
                    </Link>

                    <nav className="hidden md:flex gap-6 items-center h-full">
                        <Link
                            to="/"
                            className="font-label text-sm font-semibold pb-1 text-secondary border-b-2 border-transparent hover:text-primary transition-colors"
                        >
                            Discover
                        </Link>
                        {isAuthenticated && hasRole('DEVELOPER', 'ADMIN') && (
                            <Link
                                to="/dashboard"
                                className="font-label text-sm font-semibold pb-1 text-secondary border-b-2 border-transparent hover:text-primary transition-colors"
                            >
                                Dashboard
                            </Link>
                        )}
                    </nav>
                </div>

                <form onSubmit={handleSearchSubmit} className="relative hidden sm:block flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search apps..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-1.5 bg-surface-container-low border border-outline-variant rounded-full font-sans text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                </form>

                <div className="flex items-center gap-4 shrink-0">
                    {isAuthenticated ? (
                        <div className="flex items-center gap-3">
              <span className="hidden lg:inline-block text-xs bg-primary-container/40 text-on-primary-container px-2 py-1 rounded-full font-semibold border border-primary-container uppercase tracking-wider">
                {user?.role}
              </span>
                            <button
                                onClick={() => logout()}
                                className="font-label text-sm text-on-surface-variant hover:text-error transition-colors flex items-center gap-1"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Sign out</span>
                            </button>
                        </div>
                    ) : (
                        <Link
                            to="/login"
                            className="font-label text-sm font-semibold text-on-surface hover:text-primary transition-colors"
                        >
                            Sign in
                        </Link>
                    )}

                    {isAuthenticated && hasRole('DEVELOPER', 'ADMIN') && (
                        <Link
                            to="/dashboard/new"
                            className="bg-primary-container text-on-primary-container font-label text-sm font-bold px-4 py-2 rounded-lg hover:bg-primary-fixed-dim transition-colors shadow-sm flex items-center gap-2"
                        >
                            <Upload className="w-4 h-4 stroke-[2.5]" />
                            <span className="hidden sm:inline">Upload APK</span>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}