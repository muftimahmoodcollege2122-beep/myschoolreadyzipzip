import { ContentService } from './content.service';
export declare class ContentController {
    private readonly svc;
    constructor(svc: ContentService);
    createPost(dto: any, tid: string, u: any): Promise<any>;
    listPosts(tid: string, sid?: string, cat?: string, status?: string, search?: string, page?: string): Promise<{
        data: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getPost(id: string, tid: string): Promise<any>;
    updatePost(id: string, dto: any, tid: string): Promise<any>;
    deletePost(id: string, tid: string): Promise<any>;
    createAlbum(dto: any, tid: string, u: any): Promise<any>;
    listAlbums(tid: string, sid?: string): Promise<any>;
    addGalleryItem(albumId: string, dto: any, tid: string): Promise<any>;
    getAlbumItems(albumId: string, tid: string): Promise<any>;
    deleteGalleryItem(id: string, tid: string): Promise<any>;
    deleteAlbum(id: string, tid: string): Promise<any>;
    getSeoData(tid: string, sid: string): Promise<{
        sitemap: {
            school: string;
            posts: any;
            lastModified: Date;
        };
        metaTags: {
            title: any;
            description: string;
            keywords: string;
            ogImage: any;
        };
    }>;
    generateSitemap(tid: string, sid: string): Promise<{
        baseUrl: string;
        urls: any[];
        generatedAt: Date;
    }>;
}
