export interface ForumSource {
    url: string;
    title?: string;
    snippet?: string;
}

export interface RepairPost {
    url: string;
    title: string | null;
    content: string;
    dtcCodes: string[];
    vehicleInfo: {
        make: string | null;
        year: string | null;
    };
    timestamp: string | null;
}

export interface QueryResponse {
    answer: string;
    sources: ForumSource[];
}

export interface ProcessForumResponse {
    success: boolean;
    message: string;
}