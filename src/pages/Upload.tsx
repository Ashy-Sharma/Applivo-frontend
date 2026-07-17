import {useNavigate, useParams} from "react-router-dom";
import {type FormEvent, useEffect, useState} from "react";
import type {AppDetailResponse} from "@/types.ts";
import {createApp, getOwnedAppDetail, publishApp} from "@/api/apps.ts";
import {extractErrorMessage} from "@/api/client.ts";
import {uploadVersion} from "@/api/versions.ts";
import Spinner from "@/components/Spinner.tsx";
import {CheckCircle2, FileUp, Rocket} from "lucide-react";
import ErrorBanner from "@/components/ErrorBanner.tsx";


export default function Upload(){

    const {appId: appIdParam} = useParams<{appId?: string}>();
    const navigate = useNavigate();

    const [appId, setAppId] = useState<number | null>(appIdParam ? Number(appIdParam) : null);
    const [app, setApp] = useState<AppDetailResponse | null>(null);
    const [loadingApp, setLoadingApp] = useState(!!appIdParam);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');

    const [versionTag, setVersionTag] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [progress, setProgress] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [uploaded, setUploaded] = useState(false);
    const [creatingApp, setCreatingApp] = useState(false);

    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
       if (!appIdParam){
           return;
       }
       getOwnedAppDetail(appIdParam)
           .then(setApp)
           .catch((err) => setError(extractErrorMessage(err, 'Could not load the app')))
           .finally(() => setLoadingApp(false));
    }, [appIdParam]);

    const handleCreateApp = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setCreatingApp(true);

        try {
            const created = await createApp({name, description, category});
            setAppId(created.id);
        }catch (err){
            setError(extractErrorMessage(err, 'Could not create the app.'));
        } finally {
            setCreatingApp(false);
        }
    };


    const handleUploadVersion = async (e: FormEvent) => {
        e.preventDefault();
        if (!appId || !file){
            return;
        }
        setError(null);
        setUploading(true);
        setProgress(0);

        try {
            await uploadVersion(appId, file, versionTag, setProgress);
            setUploaded(true);
        }catch (err){
            setError(extractErrorMessage(err, 'Upload failed'));
        } finally {
            setUploading(false);
        }
    };

    const handlePublish = async () => {
        if (!appId){
            return;
        }
        setError(null);

        try {
            await publishApp(appId);
            navigate('/dashboard');
        }catch (err){
            setError(extractErrorMessage(err, 'Could not publish the app.'));
        }
    };

    if (loadingApp){
        return <Spinner label="Loading app...."/>
    }

    if(appIdParam && error && !app){
        return <ErrorBanner message={error}/>;
    }

    return (
        <div className="w-full max-w-xl mx-auto flex flex-col gap-6">
            <h1 className="font-headline text-2xl font-extrabold text-on-surface">
                {app ? `Add a version to "${app.name}"` : 'Create a new app'}
            </h1>

            {error && <ErrorBanner message={error} />}

            {!appId && (
                <form
                    onSubmit={handleCreateApp}
                    className="flex flex-col gap-4 bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-5"
                >
                    <div>
                        <label className="block font-label text-xs font-bold text-on-surface mb-2 uppercase tracking-wider">
                            App name
                        </label>
                        <input
                            required
                            maxLength={100}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Calculator Pro"
                            className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 font-sans text-sm focus:outline-none focus:border-primary"
                        />
                    </div>
                    <div>
                        <label className="block font-label text-xs font-bold text-on-surface mb-2 uppercase tracking-wider">
                            Description
                        </label>
                        <textarea
                            maxLength={2000}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            placeholder="What does this app do?"
                            className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 font-sans text-sm focus:outline-none focus:border-primary resize-none"
                        />
                    </div>
                    <div>
                        <label className="block font-label text-xs font-bold text-on-surface mb-2 uppercase tracking-wider">
                            Category
                        </label>
                        <input
                            maxLength={50}
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            placeholder="Utilities"
                            className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 font-sans text-sm focus:outline-none focus:border-primary"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={creatingApp}
                        className="bg-primary text-on-primary font-label text-sm font-bold py-2.5 rounded-lg hover:opacity-90 disabled:opacity-60"
                    >
                        {creatingApp ? 'Creating…' : 'Create app & continue'}
                    </button>
                </form>
            )}

            {appId && !uploaded && (
                <form
                    onSubmit={handleUploadVersion}
                    className="flex flex-col gap-4 bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-5"
                >
                    <div>
                        <label className="block font-label text-xs font-bold text-on-surface mb-2 uppercase tracking-wider">
                            Version tag
                        </label>
                        <input
                            required
                            maxLength={50}
                            value={versionTag}
                            onChange={(e) => setVersionTag(e.target.value)}
                            placeholder="1.0.0"
                            className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 font-sans text-sm focus:outline-none focus:border-primary"
                        />
                    </div>

                    <div>
                        <label className="block font-label text-xs font-bold text-on-surface mb-2 uppercase tracking-wider">
                            APK file
                        </label>
                        <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-outline-variant rounded-lg py-8 cursor-pointer hover:border-primary transition-colors">
                            <FileUp className="w-6 h-6 text-tertiary" />
                            <span className="font-sans text-xs text-on-surface-variant">
                {file ? file.name : 'Click to choose a .apk file (max 100MB)'}
              </span>
                            <input
                                type="file"
                                accept=".apk"
                                required
                                className="hidden"
                                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                            />
                        </label>
                    </div>

                    {uploading && (
                        <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={uploading || !file || !versionTag}
                        className="bg-primary text-on-primary font-label text-sm font-bold py-2.5 rounded-lg hover:opacity-90 disabled:opacity-60"
                    >
                        {uploading ? `Uploading… ${progress}%` : 'Upload version'}
                    </button>
                </form>
            )}

            {uploaded && (
                <div className="flex flex-col items-center gap-4 bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-8 text-center">
                    <CheckCircle2 className="w-10 h-10 text-status-success" />
                    <p className="font-headline font-bold text-on-surface">Version uploaded</p>
                    <p className="font-sans text-sm text-on-surface-variant">
                        This version is now the active one for this app.
                    </p>
                    <div className="flex gap-3 mt-2">
                        <button
                            onClick={handlePublish}
                            className="flex items-center gap-2 bg-primary text-on-primary font-label text-sm font-bold px-4 py-2 rounded-lg hover:opacity-90"
                        >
                            <Rocket className="w-4 h-4" />
                            Publish app
                        </button>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="font-label text-sm font-bold px-4 py-2 rounded-lg border border-outline-variant hover:bg-surface-container-low"
                        >
                            Back to dashboard
                        </button>
                    </div>
                </div>
            )}
        </div>
    );

}




























