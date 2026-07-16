import type {ReactNode} from "react";
import type {Role} from "@/types.ts";
import {useAuth} from "@/auth/AuthContext.tsx";
import {Navigate, useLocation} from "react-router-dom";


interface ProtectedRouteProps {
    children : ReactNode;
    allowedRoles? : Role[];
}

export default function ProtectedRoute({children, allowedRoles} : ProtectedRouteProps) {
    const {isAuthenticated, isReady, hasRole} = useAuth();
    const location = useLocation();

    if (!isReady){
        return null;
    }

    if (!isAuthenticated){
        return <Navigate to="/login" replace state={ {from: location}}></Navigate>;
    }

    if (allowedRoles && !hasRole(...allowedRoles)){
        return (
            <div className="w-full flex flex-col items-center justify-center py-24 text-center gap-2">
                <p className="font-headline text-xl font-bold text-on-surface">Access restricted</p>
                <p className="font-sans text-sm text-on-surface-variant">
                    This page is only available to developer accounts.
                </p>
            </div>
        );
    }

    return <>{children}</>

}