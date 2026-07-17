import { Link } from 'react-router-dom';

export default function NotFound() {
    return (
        <div className="w-full flex flex-col items-center justify-center gap-3 py-24 text-center">
            <p className="font-headline text-3xl font-extrabold text-on-surface">404</p>
            <p className="font-sans text-sm text-on-surface-variant">This page doesn't exist.</p>
            <Link to="/" className="font-label text-sm font-bold text-primary hover:underline mt-2">
                Back to Discover
            </Link>
        </div>
    );
}
