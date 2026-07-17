import {useEffect, useState} from "react";
import type {AppResponse, AppVersionResponse} from "@/types.ts";
import {deleteApp, getMyApps, publishApp, unpublishApp} from "@/api/apps.ts";
import {extractErrorMessage} from "@/api/client.ts";
import {Link} from "react-router-dom";
import {ChevronDown, ChevronUp, LayoutGrid, Plus, Trash2, Upload} from "lucide-react";
import Spinner from "@/components/Spinner.tsx";
import ErrorBanner from "@/components/ErrorBanner.tsx";
import {activateVersion, getVersions} from "@/api/versions.ts";


export default function Dashboard() {

    const [apps, setApps] = useState<AppResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [busyId, setBusyId] = useState<number | null>(null);
    const [expandedAppId, setExpandedAppId] = useState<number | null>(null);
    const [versionsByApp, setVersionsByApp] = useState<Record<number, AppVersionResponse[]>>({});
    const [versionsLoading, setVersionsLoading] = useState<number | null>(null);

    const load = () => {
        setLoading(true);
        getMyApps()
            .then(setApps)
            .catch((err) => {
                setError(extractErrorMessage(err, 'Could not load your apps.'));
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const toggleVersions = async (appId: number) => {
        if (expandedAppId === appId) {
            setExpandedAppId(null);
            return;
        }
        setExpandedAppId(appId);
        if (!versionsByApp[appId]) {
            setVersionsLoading(appId);
            try {
                const versions = await getVersions(appId);
                setVersionsByApp((prev) => ({...prev, [appId]: versions}));
            } catch (err) {
                setError(extractErrorMessage(err, 'Could not load versions.'));
            } finally {
                setVersionsLoading(null);
            }
        }
    };

    useEffect(load, []);

    const withBusy = async (id: number, fn: () => Promise<void>) => {

        setError(null);
        setBusyId(id);
        try {
            await fn();
            load();
        } catch (err) {
            setError(extractErrorMessage(err));
        } finally {
            setBusyId(null);
        }
    };

    const handleTogglePublish = (app: AppResponse) => {
        withBusy(app.id, async () => {
            if (app.isPublished) {
                await unpublishApp(app.id);
            } else {
                await publishApp(app.id);
            }
        });
    };

    const handleDelete = (app: AppResponse) => {
        if (!confirm(`Delete "${app.name}" and all its versions? This cannot be undone.`)) {
            return;
        }
        withBusy(app.id, () => deleteApp(app.id));
    };

    const handleActivate = (appId: number, versionId: number) =>
        withBusy(appId, async () => {
            await activateVersion(appId, versionId);
            const versions = await getVersions(appId);
            setVersionsByApp((prev) => ({...prev, [appId]: versions}));
        });

    return (
        <div className="w-full flex flex-col gap-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="font-headline text-2xl font-extrabold text-on-surface">Your apps</h1>
                    <p className="font-sans text-sm text-on-surface-variant mt-1">
                        Manage app metadata, APK versions, and publish status.
                    </p>
                </div>
                <Link
                    to="/dashboard/new"
                    className="flex items-center gap-2 bg-primary text-on-primary font-label text-sm font-bold px-4 py-2 rounded-lg hover:opacity-90"
                >
                    <Plus className="w-4 h-4"/>
                    New app
                </Link>
            </div>

            {error && <ErrorBanner message={error}/>}

            {loading ? (
                <Spinner label="Loading your apps…"/>
            ) : apps.length === 0 ? (
                <div
                    className="flex flex-col items-center justify-center gap-2 py-20 text-center border border-dashed border-outline-variant rounded-xl">
                    <LayoutGrid className="w-8 h-8 text-tertiary"/>
                    <p className="font-headline font-bold text-on-surface">No apps yet</p>
                    <p className="font-sans text-sm text-on-surface-variant">
                        Create your first app to start uploading APK builds.
                    </p>
                </div>
            ) : (
                <div
                    className="flex flex-col divide-y divide-outline-variant/40 border border-outline-variant/60 rounded-xl overflow-hidden bg-surface-container-lowest">
                    {apps.map((app) => (
                        <div key={app.id} className="flex flex-col">
                            <div className="flex items-center gap-4 px-4 py-3 flex-wrap">
                                <div
                                    className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center overflow-hidden shrink-0">
                                    {app.iconUrl ? (
                                        <img src={app.iconUrl} alt="" className="w-full h-full object-cover"/>
                                    ) : (
                                        <LayoutGrid className="w-5 h-5 text-tertiary"/>
                                    )}
                                </div>

                                <div className="min-w-0 flex-1 flex items-center gap-1.5">
                                    <div className="min-w-0">
                                        <p className="font-label text-sm font-bold text-on-surface truncate">{app.name}</p>
                                        <p className="font-sans text-xs text-on-surface-variant">
                                            {app.versionCount} version{app.versionCount === 1 ? '' : 's'} ·{' '}
                                            {app.category || 'Uncategorized'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => toggleVersions(app.id)}
                                        className="shrink-0 p-1 rounded hover:bg-surface-container-low text-on-surface-variant hover:text-primary transition-colors"
                                        title={expandedAppId === app.id ? 'Hide versions' : 'Show versions'}
                                    >
                                        {expandedAppId === app.id ? (
                                            <ChevronUp className="w-4 h-4"/>
                                        ) : (
                                            <ChevronDown className="w-4 h-4"/>
                                        )}
                                    </button>
                                </div>

                                <span
                                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                                        app.isPublished
                                            ? 'text-status-success bg-status-success/10'
                                            : 'text-on-surface-variant bg-surface-container'
                                    }`}
                                >
                {app.isPublished ? 'Published' : 'Draft'}
            </span>
                                <div className="flex items-center gap-2 shrink-0">
                                    <Link
                                        to={`/dashboard/${app.id}/upload`}
                                        className="flex items-center gap-1 text-xs font-label font-bold text-primary hover:opacity-80 px-2 py-1.5"
                                    >
                                        <Upload className="w-3.5 h-3.5"/>
                                        Add version
                                    </Link>
                                    <button
                                        disabled={busyId === app.id}
                                        onClick={() => handleTogglePublish(app)}
                                        className="text-xs font-label font-bold px-3 py-1.5 rounded-lg border border-outline-variant hover:bg-surface-container-low disabled:opacity-50"
                                    >
                                        {app.isPublished ? 'Unpublish' : 'Publish'}
                                    </button>
                                    <button
                                        disabled={busyId === app.id}
                                        onClick={() => handleDelete(app)}
                                        className="text-error p-1.5 rounded-lg hover:bg-error-container/40 disabled:opacity-50"
                                        title="Delete app"
                                    >
                                        <Trash2 className="w-4 h-4"/>
                                    </button>
                                </div>
                            </div>

                            {expandedAppId === app.id && (
                                <div className="w-full px-4 pb-3 flex flex-col gap-2">
                                    {versionsLoading === app.id ? (
                                        <Spinner label="Loading versions…"/>
                                    ) : versionsByApp[app.id]?.length === 0 ? (
                                        <p className="font-sans text-xs text-on-surface-variant px-1">No versions
                                            uploaded yet.</p>
                                    ) : (
                                        versionsByApp[app.id]?.map((v) => (
                                            <div
                                                key={v.versionId}
                                                className="flex items-center justify-between gap-3 bg-surface-container-low rounded-lg px-3 py-2"
                                            >
                                                <div>
                                                    <p className="font-sans text-xs font-bold text-on-surface">
                                                        {v.versionTag}{' '}
                                                        {v.isActive &&
                                                            <span className="text-status-success">(active)</span>}
                                                    </p>
                                                    <p className="font-sans text-[10px] text-on-surface-variant">
                                                        {(v.sizeByBytes / (1024 * 1024)).toFixed(1)} MB ·{' '}
                                                        {new Date(v.uploadedAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                {!v.isActive && (
                                                    <button
                                                        onClick={() => handleActivate(app.id, v.versionId)}
                                                        disabled={busyId === app.id}
                                                        className="text-xs font-label font-bold text-primary hover:opacity-80 disabled:opacity-50"
                                                    >
                                                        Activate
                                                    </button>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );


}