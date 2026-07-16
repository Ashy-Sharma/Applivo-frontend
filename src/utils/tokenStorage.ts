import type {UserInfo} from "@/types";

const ACCESS_TOKEN_KEY = 'applivo.accessToken';
const REFRESH_TOKEN_KEY = 'applivo.refreshToken';
const USER_KEY = 'applivo.user';

export function saveSession(accessToken : string, refreshToken : string, user : UserInfo) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function saveTokensOnly(accessToken : string, refreshToken : string) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function getAccessToken() : string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() : string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getStoredUser() : UserInfo | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw){
        return null;
    }
    try {
        return JSON.parse(raw) as UserInfo;
    }catch {
        return null;
    }
}

export function clearSession(){
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}


