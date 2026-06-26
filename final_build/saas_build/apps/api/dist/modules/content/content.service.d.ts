import { PrismaService } from '../../database/prisma.service';
export declare class ContentService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    createPost(dto: any, tenantId: string, authorId: string): Promise<any>;
    listPosts(tenantId: string, schoolId?: string, category?: string, status?: string, search?: string, page?: number, limit?: number): Promise<{
        data: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getPost(id: string, tenantId: string): Promise<any>;
    getPostBySlug(slug: string, schoolId: string): Promise<any>;
    updatePost(id: string, dto: any, tenantId: string): Promise<any>;
    deletePost(id: string, tenantId: string): Promise<any>;
    createAlbum(dto: any, tenantId: string, createdById: string): Promise<any>;
    listAlbums(tenantId: string, schoolId?: string, isPublic?: boolean): Promise<any>;
    addGalleryItem(albumId: string, dto: any, tenantId: string): Promise<any>;
    getAlbumItems(albumId: string, tenantId: string): Promise<any>;
    deleteGalleryItem(id: string, tenantId: string): Promise<any>;
    deleteAlbum(id: string, tenantId: string): Promise<any>;
    getSeoData(schoolId: string, tenantId: string): Promise<{
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
    generateSitemap(schoolId: string, tenantId: string): Promise<{
        baseUrl: string;
        urls: any[];
        generatedAt: Date;
    }>;
}
