import { AlertTriangle } from 'lucide-react';

export default function ErrorBanner({ message }: { message: string }) {
    return (
        <div className="w-full flex items-center gap-2 bg-error-container/60 border border-error/30 text-error rounded-lg px-4 py-3 text-sm font-sans">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{message}</span>
        </div>
    );
}
