import type {AppDetailResponse, AppResponse, PageResponse} from "@/types.ts";
import {api} from "@/api/client.ts";


export async function getPublicApps(page = 0, size = 12): Promise<PageResponse<AppResponse>> {

    const {data} = await api.get<PageResponse<AppResponse>>('/api/public/apps', {
        params: {page, size}
    });
    return data;

}


export async function searchPublicApps(query: string, page = 0, size = 12) : Promise<PageResponse<AppResponse>> {

    const {data} = await api.get<PageResponse<AppResponse>>('/api/public/apps/search', {
        params: {query, page, size}
    });
    return data;

}

export async function getPublicAppDetail(id: number | string): Promise<AppDetailResponse>{
    const {data} = await api.get<AppDetailResponse>(`/api/public/apps/${id}`);
    return data;
}

export interface CreateAppPayload{
    name: string;
    description?: string;
    category?: string;
    iconUrl?: string;
}

export interface UpdateAppPayload{
    name?: string;
    description?: string;
    category?: string;
    iconUrl?: string;
}

export async function getMyApps() : Promise<AppResponse[]> {
    const {data} = await api.get<AppResponse[]>('/api/apps/my');
    return data;
}

export async function getOwnedAppDetail(id : number | string) : Promise<AppDetailResponse> {
    const {data} = await api.get<AppDetailResponse>(`/api/apps/${id}`);
    return data;
}

export async function updateApp(id: number | string, payload : UpdateAppPayload) : Promise<AppResponse>{
    const {data} = await api.put<AppResponse>(`/api/apps/${id}`, payload);
    return data;
}

export async function deleteApp(id : number | string) : Promise<void> {
    await api.delete<void>(`/api/apps/${id}`);
}

export async function publishApp(id: number | string) : Promise<AppResponse> {
    const {data} = await api.post<AppResponse>(`/api/apps/${id}/publish`);
    return data;
}

export async function unpublishApp(id: number | string) : Promise<AppResponse> {
    const {data} = await api.post<AppResponse>(`/api/apps/${id}/unpublish`);
    return data;
}

export async function createApp(payload : CreateAppPayload) : Promise<AppResponse> {
    const {data} = await api.post<AppResponse>('/api/apps', payload);
    return data;
}






























