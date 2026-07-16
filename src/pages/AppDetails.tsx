import {useNavigate, useParams} from "react-router-dom";
import {useAuth} from "@/auth/AuthContext.tsx";
import {useEffect, useState} from "react";
import type {AppDetailResponse} from "@/types.ts";
import {getPublicAppDetail} from "@/api/apps.ts";
import {extractErrorMessage} from "@/api/client.ts";
import {createSession} from "@/api/sessions.ts";
import Spinner from "@/components/Spinner.tsx";
import ErrorBanner from "@/components/ErrorBanner.tsx";
import {LayoutGrid, PlayCircle} from "lucide-react";


export default function AppDetails() {
    const {id} = useParams< {id: string}>();
    const navigate = useNavigate();
    const {isAuthenticated} = useAuth();

    const [app, setApp] = useState<AppDetailResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [launchingVersionId, setLaunchingVersionId] = useState<number | null>(null);

    useEffect(() => {
        if (!id){
            return;
        }
        setLoading(true);
        setError(null);
        getPublicAppDetail(id)
            .then(setApp)
            .catch((err) => {
                setError(extractErrorMessage(err, 'App not found!'));
            })
            .finally(() => {
                setLoading(false);
            })
    }, [id]);

    const handleTryDemo = async (versionId: number) => {
        if (!isAuthenticated){
            navigate('/login', {state: {from : {pathname : `/apps/${id}`}}});
            return;
        }
        setError(null);
        setLaunchingVersionId(versionId);
        try {
            const session = await createSession(versionId);
            navigate(`/demo/${session.sessionId}`);
        }catch (e) {
            setError(extractErrorMessage(e, 'Could not start a demo session.'));
            setLaunchingVersionId(null);
        }
    };

    if (loading){
        return<Spinner label="Loading app...." />
    }

    if (error && !app){
        return <ErrorBanner message={error}/>
    }

    if (!app){
        return null;
    }

    const sortedVersions = [...app.versions].sort((a, b) =>
        (a.uploadedAt < b.uploadedAt ? 1 : -1)
    );

    return (
        <div className="w-full flex flex-col gap-6 max-w-3xl mx-auto">
            {error && <ErrorBanner message={error} />}

            <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-surface-container flex items-center justify-center overflow-hidden shrink-0">
                    {app.iconUrl ? (
                        <img src={app.iconUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <LayoutGrid className="w-8 h-8 text-tertiary" />
                    )}
                </div>
                <div className="min-w-0">
                    <h1 className="font-headline text-2xl font-extrabold text-on-surface">{app.name}</h1>
                    <p className="font-sans text-sm text-on-surface-variant">by {app.developerUsername}</p>
                    {app.category && (
                        <span className="inline-block mt-2 text-[10px] font-label font-bold uppercase tracking-wider text-primary bg-primary-container/30 px-2 py-0.5 rounded-full">
              {app.category}
            </span>
                    )}
                </div>
            </div>

            <p className="font-sans text-sm text-on-surface leading-relaxed">
                {app.description || 'No description provided.'}
            </p>

            <div>
                <h2 className="font-headline text-sm font-bold text-on-surface mb-3 uppercase tracking-wider">
                    Versions
                </h2>
                <div className="flex flex-col gap-2">
                    {sortedVersions.length === 0 && (
                        <p className="font-sans text-sm text-on-surface-variant">No versions uploaded yet.</p>
                    )}
                    {sortedVersions.map((v) => (
                        <div
                            key={v.versionId}
                            className="flex items-center justify-between gap-3 bg-surface-container-lowest border border-outline-variant/60 rounded-lg px-4 py-3"
                        >
                            <div>
                                <p className="font-label text-sm font-bold text-on-surface flex items-center gap-2">
                                    {v.versionTag}
                                    {v.isActive && (
                                        <span className="text-[9px] font-bold uppercase tracking-wider text-status-success bg-status-success/10 px-1.5 py-0.5 rounded-full">
                      Active
                    </span>
                                    )}
                                </p>
                                <p className="font-sans text-xs text-on-surface-variant">
                                    {(v.sizeByBytes / (1024 * 1024)).toFixed(1)} MB · uploaded{' '}
                                    {new Date(v.uploadedAt).toLocaleDateString()}
                                </p>
                            </div>
                            <button
                                onClick={() => handleTryDemo(v.versionId)}
                                disabled={!v.isActive || launchingVersionId !== null}
                                className="shrink-0 flex items-center gap-2 bg-primary text-on-primary font-label text-xs font-bold px-3 py-2 rounded-lg hover:opacity-90 disabled:opacity-40 transition-all"
                            >
                                <PlayCircle className="w-4 h-4" />
                                {launchingVersionId === v.versionId ? 'Starting…' : 'Try demo'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

}

























































