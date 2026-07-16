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