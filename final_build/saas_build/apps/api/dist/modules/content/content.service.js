"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ContentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let ContentService = ContentService_1 = class ContentService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ContentService_1.name);
    }
    async createPost(dto, tenantId, authorId) {
        const slug = dto.slug ?? dto.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        return this.prisma.blogPost.create({
            data: { tenantId, schoolId: dto.schoolId, title: dto.title, slug, content: dto.content, excerpt: dto.excerpt,
                coverUrl: dto.coverUrl, category: dto.category ?? 'NEWS', tags: dto.tags ?? [], status: dto.status ?? 'DRAFT',
                publishedAt: dto.status === 'PUBLISHED' ? new Date() : null, authorId, seoTitle: dto.seoTitle, seoDescription: dto.seoDescription, isPublic: dto.isPublic ?? true },
        });
    }
    async listPosts(tenantId, schoolId, category, status, search, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const where = { tenantId, ...(schoolId && { schoolId }), ...(category && { category }), ...(status && { status }), ...(search && { OR: [{ title: { contains: search, mode: 'insensitive' } }, { excerpt: { contains: search, mode: 'insensitive' } }] }) };
        const [data, total] = await Promise.all([
            this.prisma.blogPost.findMany({ where, orderBy: { publishedAt: 'desc' }, skip, take: limit }),
            this.prisma.blogPost.count({ where }),
        ]);
        return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    }
    async getPost(id, tenantId) {
        const p = await this.prisma.blogPost.findFirst({ where: { id, tenantId } });
        if (!p)
            throw new common_1.NotFoundException('Post not found');
        await this.prisma.blogPost.update({ where: { id }, data: { views: { increment: 1 } } });
        return p;
    }
    async getPostBySlug(slug, schoolId) {
        const p = await this.prisma.blogPost.findFirst({ where: { slug, schoolId, status: 'PUBLISHED', isPublic: true } });
        if (!p)
            throw new common_1.NotFoundException('Post not found');
        await this.prisma.blogPost.update({ where: { id: p.id }, data: { views: { increment: 1 } } });
        return p;
    }
    async updatePost(id, dto, tenantId) {
        const p = await this.prisma.blogPost.findFirst({ where: { id, tenantId } });
        if (!p)
            throw new common_1.NotFoundException('Post not found');
        const update = { ...dto, updatedAt: new Date() };
        if (dto.status === 'PUBLISHED' && !p.publishedAt)
            update.publishedAt = new Date();
        return this.prisma.blogPost.update({ where: { id }, data: update });
    }
    async deletePost(id, tenantId) {
        await this.prisma.blogPost.findFirst({ where: { id, tenantId } }) || (() => { throw new common_1.NotFoundException('Post not found'); })();
        return this.prisma.blogPost.delete({ where: { id } });
    }
    async createAlbum(dto, tenantId, createdById) {
        return this.prisma.galleryAlbum.create({
            data: { tenantId, schoolId: dto.schoolId, title: dto.title, description: dto.description, coverUrl: dto.coverUrl, isPublic: dto.isPublic ?? true, createdById },
        });
    }
    async listAlbums(tenantId, schoolId, isPublic) {
        return this.prisma.galleryAlbum.findMany({
            where: { tenantId, ...(schoolId && { schoolId }), ...(isPublic !== undefined && { isPublic }) },
            include: { _count: { select: { items: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async addGalleryItem(albumId, dto, tenantId) {
        const album = await this.prisma.galleryAlbum.findFirst({ where: { id: albumId, tenantId } });
        if (!album)
            throw new common_1.NotFoundException('Album not found');
        return this.prisma.galleryItem.create({ data: { albumId, tenantId, url: dto.url, thumbnailUrl: dto.thumbnailUrl, type: dto.type ?? 'IMAGE', title: dto.title, caption: dto.caption } });
    }
    async getAlbumItems(albumId, tenantId) {
        return this.prisma.galleryItem.findMany({ where: { albumId, tenantId }, orderBy: { sortOrder: 'asc' } });
    }
    async deleteGalleryItem(id, tenantId) {
        return this.prisma.galleryItem.delete({ where: { id } });
    }
    async deleteAlbum(id, tenantId) {
        return this.prisma.galleryAlbum.delete({ where: { id } });
    }
    async getSeoData(schoolId, tenantId) {
        const school = await this.prisma.school.findFirst({ where: { id: schoolId, tenantId } });
        const posts = await this.prisma.blogPost.count({ where: { schoolId, tenantId, status: 'PUBLISHED' } });
        return {
            sitemap: { school: `/s/${school?.code?.toLowerCase()}`, posts, lastModified: new Date() },
            metaTags: { title: school?.name, description: `${school?.name} - Official School Portal`, keywords: ['school', 'education', school?.name ?? ''].join(', '), ogImage: school?.logoUrl },
        };
    }
    async generateSitemap(schoolId, tenantId) {
        const [school, posts] = await Promise.all([
            this.prisma.school.findFirst({ where: { id: schoolId, tenantId } }),
            this.prisma.blogPost.findMany({ where: { schoolId, tenantId, status: 'PUBLISHED' }, select: { slug: true, updatedAt: true } }),
        ]);
        if (!school)
            throw new common_1.NotFoundException('School not found');
        const baseUrl = `https://${school.code.toLowerCase()}.myschool.app`;
        const urls = [`${baseUrl}/`, `${baseUrl}/admissions`, `${baseUrl}/contact`, `${baseUrl}/about`,
            ...posts.map(p => ({ url: `${baseUrl}/news/${p.slug}`, lastmod: p.updatedAt.toISOString() }))];
        return { baseUrl, urls, generatedAt: new Date() };
    }
};
exports.ContentService = ContentService;
exports.ContentService = ContentService = ContentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ContentService);
//# sourceMappingURL=content.service.js.map