import {Loader2} from "lucide-react";

export default function Spinner( {label} : {label?: string}){
    return(
        <div className="w-full flex flex-col items-center justify-center gap-3 py-16 text-on-surface-variant">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            {label && <p className="font-sans text-sm">{label}</p>}
        </div>
    );
}