export type Role = 'USER' | 'DEVELOPER' | 'ADMIN';

export interface UserInfo {
    id : number;
    email : string;
    username : string;
    role : Role;
    avatarUrl : string | null;
}

export interface AuthResponse {

    accessToken : string;
    refreshToken : string;
    tokenType : string;
    userInfo : UserInfo;

}

export interface AppResponse {

    id: number;
    name: string;
    description: string | null;
    category: string | null;
    iconUrl: string | null;
    isPublished: boolean;
    createdAt: string;
    updatedAt: string;
    developerId: number;
    developerUsername: string;
    versionCount: number;

}

export interface AppVersionResponse {

    versionId: number;
    versionTag: string;
    sizeByBytes: number;
    isActive: boolean;
    uploadedAt:string;

}

export interface AppDetailResponse extends AppResponse{

    versions: AppVersionResponse[];

}

export interface PageResponse<T> {
    content : T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

export interface SessionResponse {
    sessionId: number;
    appVersionId: number;
    status: string;
    wsEndpoint: string;
    subscriptionTopic: string;
    startedAt: string;
    screenWidth: number;
    screenHeight: number;
}

export interface SessionStatusResponse {
    sessionId: number;
    status: 'CREATING' | 'ACTIVE' | 'FAILED' | 'ENDED' | 'TIMED_OUT';
    message: string;
    screenWidth: number | null;
    screenHeight: number | null;
}

export interface UploadResponse{
    versionId: number;
    versionTag: string;
    sizeBytes: number;
    uploadedAt: string;
    message: string;
}

export type InteractionType = 'TAP' | 'SWIPE' | 'TEXT' | 'KEY';

export interface InteractionMessage {
    type: InteractionType;
    x?: number;
    y?: number;
    x2?: number;
    y2?: number;
    duration?: number;
    text?: string;
    keyCode?: number;
}

export interface ScreenshotMessage {
    type: 'SCREENSHOT';
    data: string;
    timestamp: string;
}




