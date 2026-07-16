import type {AppResponse} from "@/types.ts";
import { Link } from "react-router-dom";
import {LayoutGrid} from "lucide-react";

export default function AppCard( { app} : {app : AppResponse}){
    return (
        <Link
            to={`/apps/${app.id}`}
            className="flex flex-col bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-4 hover:shadow-md hover:border-primary/40 transition-all"
        >
            <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center overflow-hidden shrink-0">
                    {app.iconUrl ? (
                        <img src={app.iconUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <LayoutGrid className="w-6 h-6 text-tertiary" />
                    )}
                </div>
                <div className="min-w-0">
                    <p className="font-headline font-bold text-sm text-on-surface truncate">{app.name}</p>
                    <p className="font-sans text-xs text-on-surface-variant truncate">
                        by {app.developerUsername}
                    </p>
                </div>
            </div>

            <p className="font-sans text-xs text-on-surface-variant line-clamp-2 flex-grow">
                {app.description || 'No description provided.'}
            </p>

            <div className="flex items-center justify-between mt-3">
                {app.category && (
                    <span className="text-[10px] font-label font-bold uppercase tracking-wider text-primary bg-primary-container/30 px-2 py-0.5 rounded-full">
            {app.category}
          </span>
                )}
                <span className="text-[10px] font-sans text-tertiary ml-auto">
          {app.versionCount} version{app.versionCount === 1 ? '' : 's'}
        </span>
            </div>
        </Link>
    );
}