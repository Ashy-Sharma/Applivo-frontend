import axios, {AxiosError, type InternalAxiosRequestConfig} from 'axios';

import {API_BASE_URL} from '@/config';
import {clearSession, getAccessToken, getRefreshToken, saveTokensOnly} from "@/utils/tokenStorage.ts";
import type {AuthResponse} from "@/types.ts";


const bare = axios.create({baseURL : API_BASE_URL});

export const api = axios.create({baseURL : API_BASE_URL});

api.interceptors.request.use(( config : InternalAxiosRequestConfig) => {

    const token = getAccessToken();
    if (token){
        config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;

});

export function dispatchAuthLogout() {
    clearSession();
    window.dispatchEvent(new Event('applivo:auth-logout'));
}

let refreshPromise : Promise<string> | null = null;

async function refreshAccessToken() : Promise<string> {
    if (!refreshPromise){
        refreshPromise = (async () => {
            const refreshToken = getRefreshToken();
            if (!refreshToken){
                throw new Error('No refresh token available');
            }

            const {data} = await bare.post<AuthResponse> ('/api/auth/refresh', {
                refreshToken,
            });
            saveTokensOnly(data.accessToken, data.refreshToken);
            return data.accessToken;
        })().finally(() => {
            refreshPromise = null;
        });
    }
    return refreshPromise;
}

interface RetryableConfig extends InternalAxiosRequestConfig {
    _retry? : boolean;
}

api.interceptors.response.use(
    (response) => response,
    async (error : AxiosError) => {
        const original = error.config as RetryableConfig | undefined;

        const isAuthEndpoint =  original?.url?.includes('/api/auth/');

        if (error.response?.status === 401 && original && !original._retry && !isAuthEndpoint){
            original._retry = true;
            try {
                const newAccessToken = await  refreshAccessToken();
                original.headers.set(
                    "Authorization",
                    `Bearer ${newAccessToken}`
                );
                return api(original);

            }catch (refreshError){
                dispatchAuthLogout();
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    },
);

export function extractErrorMessage(err : unknown, fallback = 'Something went wrong!') : string {
    if (axios.isAxiosError(err)){
        const data = err.response?.data as {message?: string} | undefined;
        if (data?.message){
            return data.message;
        }
        if (err.message){
            return err.message;
        }
    }
    return fallback;
}
























