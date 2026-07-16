import type {AuthResponse, Role} from "@/types.ts";
import {api} from "@/api/client.ts";
import {getRefreshToken} from "@/utils/tokenStorage.ts";

export interface RegisterPayload {
    email: string;
    username: string;
    password: string;
    role : Extract<Role, 'USER' | 'DEVELOPER'>;
}

export interface LoginPayload {
    email : string;
    password : string;
}

export async function registerRequest(payload : RegisterPayload) : Promise<AuthResponse> {
    const {data} = await api.post<AuthResponse>('/api/auth/register', payload);
    return data;
}

export async function loginRequest(payload : LoginPayload) : Promise<AuthResponse> {
    const {data} = await api.post<AuthResponse>('/api/auth/login', payload);
    return data;
}

export async function logoutRequest(): Promise<void> {
    const refreshToken = getRefreshToken();
    if (!refreshToken){
        return ;
    }
    await api.post('/api/auth/logout', {refreshToken});
}