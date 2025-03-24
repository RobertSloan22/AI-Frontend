import axios from 'axios';
import { VehicleInfo } from '../types/vehicle';

interface ForumSource {
    url: string;
    title?: string;
    snippet?: string;
}

interface RepairPost {
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
interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}
interface ForumDTCAnalyzerProps {
    forumUrl: string;
}
interface QueryResponse {
    answer: string;
    sources: ForumSource[];
}

interface ProcessForumResponse {
    success: boolean;
    message: string;
    pagesProcessed: number;
    totalChunks: number;
    
}

export class ForumCrawlerService {
    private static readonly API_URL = '/api/forum-crawler';
    private static ws: WebSocket | null = null;

    public static async processForum(
        url: string, 
        question?: string,
        onProgress?: (data: any) => void
    ): Promise<ProcessForumResponse> {
        try {
            // Close any existing WebSocket connection
            if (this.ws) {
                this.ws.close();
            }

            // Create new WebSocket connection
            this.ws = new WebSocket(`ws://${window.location.host}/ws`);            
            if (onProgress) {
                this.ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        if (data.type === 'progress') {
                            const progressData = {
                                depth: data.depth || 0,
                                linksFound: data.linksFound || 0,
                                chunksCreated: data.chunksCreated || 0,
                                currentPage: data.currentPage || '',
                                pagesProcessed: data.pagesProcessed || 0,
                                totalChunks: data.totalChunks || 0,
                                status: data.status || 'Processing...'
                            };
                            onProgress(progressData);
                        }
                    } catch (error) {
                        console.error('Error parsing WebSocket message:', error);
                    }
                };
                
                // Add error handling for WebSocket
                this.ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    onProgress({
                        status: 'Error connecting to server'
                    });
                };
                
                // Add connection handling
                this.ws.onopen = () => {
                    console.log('WebSocket connected');
                    onProgress({
                        status: 'Connected to server'
                    });
                };
                        
            }

            const response = await axios.post<ProcessForumResponse>(
                `${this.API_URL}/process`, 
                { url, question }
            );

            // Close WebSocket after processing is complete
            if (this.ws) {
                this.ws.close();
                this.ws = null;
            }

            return response.data;
        } catch (error) {
            // Ensure WebSocket is closed on error
            if (this.ws) {
                this.ws.close();
                this.ws = null;
            }
            console.error('Error processing forum:', error);
            throw error;
        }
    }

    public static async queryForum(question: string): Promise<QueryResponse> {
        try {
            const response = await axios.post<QueryResponse>(`${this.API_URL}/query`, { question });
            return response.data;
        } catch (error) {
            console.error('Error querying forum:', error);
            throw error;
        }
    }

    public static async searchForumPosts(
        vehicleInfo: Partial<VehicleInfo> = {},
        dtcCode?: string,
        forumUrls: string[] = []
    ): Promise<RepairPost[]> {
        try {
            const response = await axios.post<RepairPost[]>(`${this.API_URL}/search`, {
                vehicleInfo: {
                    make: vehicleInfo.make || null,
                    year: vehicleInfo.year || null,
                    model: vehicleInfo.model || null
                },
                dtcCode,
                forumUrls
            });
            return response.data;
        } catch (error) {
            console.error('Error searching forum posts:', error);
            throw error;
        }
    }

    // Helper method to validate forum URL
    private static isValidForumUrl(url: string): boolean {
        try {
            const urlObj = new URL(url);
            // Add any specific forum domain validations here
            return true;
        } catch {
            return false;
        }
    }

    // Helper method to sanitize input
    private static sanitizeInput(text: string): string {
        return text.trim();
    }

    // Add BMW Forums specific method
    public static async processBMWForum(url: string, options?: {
        maxDepth?: number;
        maxPages?: number;
        question?: string;
    }): Promise<ProcessForumResponse> {
        try {
            const response = await axios.post<ProcessForumResponse>(
                `${this.API_URL}/process-bmw`,
                { url, options }
            );
            return response.data;
        } catch (error) {
            console.error('Error processing BMW forum:', error);
            throw error;
        }
    }
}

// Export interfaces for use in other components
export type { RepairPost, QueryResponse, ProcessForumResponse, ForumSource };

