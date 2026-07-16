import {useSearchParams} from "react-router-dom";
import {useEffect, useState} from "react";
import type {AppResponse} from "@/types.ts";
import {getPublicApps, searchPublicApps} from "@/api/apps.ts";
import {extractErrorMessage} from "@/api/client.ts";
import ErrorBanner from "@/components/ErrorBanner.tsx";
import Spinner from "@/components/Spinner.tsx";
import {LayoutGrid, Search} from "lucide-react";
import AppCard from "@/components/AppCard.tsx";

const PAGE_SIZE = 12;

export default function Discover() {
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('q') ?? '';
    const page = Number(searchParams.get('page') ?? '0');

    const [apps, setApps] = useState<AppResponse[]>([]);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [inputValue, setInputValue] = useState(query);
    useEffect(() => {

        const timer = setTimeout(() => {
            const params = new URLSearchParams(searchParams);
            if(inputValue.trim()){
                params.set('q', inputValue.trim());
            }else {
                params.delete('q');
            }
            params.set('page', '0');
            setSearchParams(params);
        }, 400);
        return () => {
            clearTimeout(timer);
        }
    }, [inputValue]);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);

        const fetcher = query.trim()
        ? searchPublicApps(query.trim(), page, PAGE_SIZE)
            : getPublicApps(page, PAGE_SIZE);

        fetcher
            .then((res) => {
            if (cancelled){
                return;
            }
            setApps(res.content);
            setTotalPages(res.totalPages);
            })
            .catch((err) => {
                if (!cancelled){
                    setError(extractErrorMessage(err, 'Could not load apps.'))
                }
            })
            .finally(() => {
                if (!cancelled){
                    setLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };


    }, [query, page]);

    const goToPage = (next : number) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', String(next));
        setSearchParams(params);
    };

    return (
        <div className="w-full flex flex-col gap-6">
            <div>
                <h1 className="font-headline text-2xl md:text-3xl font-extrabold text-on-surface">
                    {query ? `Results for "${query}"` : 'Discover apps'}
                </h1>
                <p className="font-sans text-sm text-on-surface-variant mt-1">
                    Try live, interactive Android demos right in your browser.
                </p>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Search apps…"
                    className="w-fAppDetailsull pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-full font-sans text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                />
            </div>

            {error && <ErrorBanner message={error} />}

            {loading ? (
                <Spinner label="Loading apps…" />
            ) : apps.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-20 text-center border border-dashed border-outline-variant rounded-xl">
                    <LayoutGrid className="w-8 h-8 text-tertiary" />
                    <p className="font-headline font-bold text-on-surface">No apps found</p>
                    <p className="font-sans text-sm text-on-surface-variant">
                        {query ? 'Try a different search term.' : 'Nobody has published an app yet.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {apps.map((app) => (
                        <AppCard key={app.id} app={app} />
                    ))}
                </div>
            )}

            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-4">
                    <button
                        disabled={page <= 0}
                        onClick={() => goToPage(page - 1)}
                        className="px-3 py-1.5 rounded-lg border border-outline-variant text-sm font-label disabled:opacity-40 hover:bg-surface-container-low"
                    >
                        Previous
                    </button>
                    <span className="font-sans text-xs text-on-surface-variant">
            Page {page + 1} of {totalPages}
          </span>
                    <button
                        disabled={page >= totalPages - 1}
                        onClick={() => goToPage(page + 1)}
                        className="px-3 py-1.5 rounded-lg border border-outline-variant text-sm font-label disabled:opacity-40 hover:bg-surface-container-low"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );

}