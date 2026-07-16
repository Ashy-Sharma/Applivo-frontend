import type {SessionResponse, SessionStatusResponse} from "@/types.ts";
import {api} from "@/api/client.ts";

export async function createSession(appVersionId: number) : Promise<SessionResponse> {
    const { data } = await  api.post<SessionResponse>('/api/sessions', {appVersionId});
    return data;
}

export async function getSessionStatus(sessionId: number | string) : Promise<SessionStatusResponse> {
    const { data } = await  api.get<SessionStatusResponse>(`/api/sessions/${sessionId}/status`);
    return data;
}

export async function endSession(sessionId : number | string) : Promise<void> {
    await api.delete(`/api/sessions/${sessionId}`);
}
