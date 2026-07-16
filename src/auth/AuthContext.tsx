import type {Role, UserInfo} from "@/types.ts";
import {loginRequest, logoutRequest, type RegisterPayload, registerRequest} from "@/api/auth.ts";
import {createContext, type ReactNode, useContext, useEffect, useMemo, useState} from "react";
import {clearSession, getStoredUser, saveSession} from "@/utils/tokenStorage.ts";

interface AuthContextValue {
    user : UserInfo | null;
    isAuthenticated : boolean;
    isReady : boolean;
    login : (email : string, password : string) => Promise<void>;
    register : (payload : RegisterPayload) => Promise<void>;
    logout: () => Promise<void>;
    hasRole: (...roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextValue  | undefined>(undefined);

export function AuthProvider({children}: {children: ReactNode}) {
    const [user, setUser] = useState <UserInfo | null>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        setUser(getStoredUser());
        setIsReady(true);

        const handleForcedLogout = () => setUser(null);
        window.addEventListener('applivo:auth-logout', handleForcedLogout);
        return () => window.removeEventListener('applivo:auth-logout', handleForcedLogout);
    }, []);


    const login = async (email: string, password : string) => {
        const res = await loginRequest({email, password});
        saveSession(res.accessToken, res.refreshToken, res.userInfo);
        setUser(res.userInfo);
    };

    const register = async (payload : RegisterPayload) => {
        const res = await registerRequest(payload);
        saveSession(res.accessToken, res.refreshToken, res.userInfo);
        setUser(res.userInfo);
    }

    const logout = async () => {
        try {
            await logoutRequest();
        } catch {
            // to stop error propagation
        } finally {
            clearSession();
            setUser(null);
        }
    };

    const hasRole = (...roles: Role[]) => !!user && roles.includes(user.role);

    const value = useMemo<AuthContextValue>(
        () => ({
            user, isAuthenticated: !!user, isReady, login, register, logout, hasRole
        }),
        [user, isReady],
    );

    return<AuthContext.Provider value={value}>{children}</AuthContext.Provider>;

}

export function useAuth() : AuthContextValue {
    const context = useContext(AuthContext);
    if (!context){
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}