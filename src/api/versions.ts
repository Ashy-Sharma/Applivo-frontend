import type {AppVersionResponse, UploadResponse} from "@/types.ts";
import {api} from "@/api/client.ts";

export async function getVersions(appId : number | string) : Promise<AppVersionResponse[]> {
    const {data} = await api.get<AppVersionResponse[]>(`/api/apps/${appId}/versions`);
    return data;
}

export async function deleteVersion(appId : number | string, versionId : number | string) : Promise<void> {
    await api.delete(`/api/apps/${appId}/versions/${versionId}`);
}

export async function activateVersion(appId : number | string, versionId : number | string) : Promise<AppVersionResponse> {
    const {data} = await api.put<AppVersionResponse>(`/api/apps/${appId}/versions/${versionId}/activate`);
    return data;
}

export async function uploadVersion(
    appId : number | string,
    file : File,
    versionTag : string,
    onProgress?: (percent : number) => void
): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('versionTag', versionTag);

    const {data} = await api.post<UploadResponse>(
        `/api/apps/${appId}/versions`,
        formData, {
            headers : {'Content-Type' : 'multipart/form-data'},
            onUploadProgress: (evt) => {
                if (onProgress && evt.total ){
                    onProgress(Math.round((evt.loaded/evt.total)*100));
                }
            },
        }
    );
    return data;
}
