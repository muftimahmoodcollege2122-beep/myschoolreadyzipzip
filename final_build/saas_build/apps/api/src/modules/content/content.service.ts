import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ContentService {
  private readonly logger = new Logger(ContentService.name);
  constructor(private readonly prisma: PrismaService) {}

  // ── Blog Posts ─────────────────────────────────────────────
  async createPost(dto: any, tenantId: string, authorId: string) {
    const slug = dto.slug ?? dto.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return this.prisma.blogPost.create({
      data: { tenantId, schoolId: dto.schoolId, title: dto.title, slug, content: dto.content, excerpt: dto.excerpt,
              coverUrl: dto.coverUrl, category: dto.category ?? 'NEWS', tags: dto.tags ?? [], status: dto.status ?? 'DRAFT',
              publishedAt: dto.status === 'PUBLISHED' ? new Date() : null, authorId, seoTitle: dto.seoTitle, seoDescription: dto.seoDescription, isPublic: dto.isPublic ?? true },
    });
  }

  async listPosts(tenantId: string, schoolId?: string, category?: string, status?: string, search?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId, ...(schoolId && { schoolId }), ...(category && { category }), ...(status && { status }), ...(search && { OR: [{ title: { contains: search, mode: 'insensitive' } }, { excerpt: { contains: search, mode: 'insensitive' } }] }) };
    const [data, total] = await Promise.all([
      this.prisma.blogPost.findMany({ where, orderBy: { publishedAt: 'desc' }, skip, take: limit }),
      this.prisma.blogPost.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getPost(id: string, tenantId: string) {
    const p = await this.prisma.blogPost.findFirst({ where: { id, tenantId } });
    if (!p) throw new NotFoundException('Post not found');
    await this.prisma.blogPost.update({ where: { id }, data: { views: { increment: 1 } } });
    return p;
  }

  async getPostBySlug(slug: string, schoolId: string) {
    const p = await this.prisma.blogPost.findFirst({ where: { slug, schoolId, status: 'PUBLISHED', isPublic: true } });
    if (!p) throw new NotFoundException('Post not found');
    await this.prisma.blogPost.update({ where: { id: p.id }, data: { views: { increment: 1 } } });
    return p;
  }

  async updatePost(id: string, dto: any, tenantId: string) {
    const p = await this.prisma.blogPost.findFirst({ where: { id, tenantId } });
    if (!p) throw new NotFoundException('Post not found');
    const update: any = { ...dto, updatedAt: new Date() };
    if (dto.status === 'PUBLISHED' && !p.publishedAt) update.publishedAt = new Date();
    return this.prisma.blogPost.update({ where: { id }, data: update });
  }

  async deletePost(id: string, tenantId: string) {
    await this.prisma.blogPost.findFirst({ where: { id, tenantId } }) || (() => { throw new NotFoundException('Post not found'); })();
    return this.prisma.blogPost.delete({ where: { id } });
  }

  // ── Gallery ────────────────────────────────────────────────
  async createAlbum(dto: any, tenantId: string, createdById: string) {
    return this.prisma.galleryAlbum.create({
      data: { tenantId, schoolId: dto.schoolId, title: dto.title, description: dto.description, coverUrl: dto.coverUrl, isPublic: dto.isPublic ?? true, createdById },
    });
  }

  async listAlbums(tenantId: string, schoolId?: string, isPublic?: boolean) {
    return this.prisma.galleryAlbum.findMany({
      where: { tenantId, ...(schoolId && { schoolId }), ...(isPublic !== undefined && { isPublic }) },
      include: { _count: { select: { items: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addGalleryItem(albumId: string, dto: any, tenantId: string) {
    const album = await this.prisma.galleryAlbum.findFirst({ where: { id: albumId, tenantId } });
    if (!album) throw new NotFoundException('Album not found');
    return this.prisma.galleryItem.create({ data: { albumId, tenantId, url: dto.url, thumbnailUrl: dto.thumbnailUrl, type: dto.type ?? 'IMAGE', title: dto.title, caption: dto.caption } });
  }

  async getAlbumItems(albumId: string, tenantId: string) {
    return this.prisma.galleryItem.findMany({ where: { albumId, tenantId }, orderBy: { sortOrder: 'asc' } });
  }

  async deleteGalleryItem(id: string, tenantId: string) {
    return this.prisma.galleryItem.delete({ where: { id } });
  }

  async deleteAlbum(id: string, tenantId: string) {
    return this.prisma.galleryAlbum.delete({ where: { id } });
  }

  // ── SEO ────────────────────────────────────────────────────
  async getSeoData(schoolId: string, tenantId: string) {
    const school = await this.prisma.school.findFirst({ where: { id: schoolId, tenantId } });
    const posts = await this.prisma.blogPost.count({ where: { schoolId, tenantId, status: 'PUBLISHED' } });
    return {
      sitemap: { school: `/s/${school?.code?.toLowerCase()}`, posts, lastModified: new Date() },
      metaTags: { title: school?.name, description: `${school?.name} - Official School Portal`, keywords: ['school', 'education', school?.name ?? ''].join(', '), ogImage: school?.logoUrl },
    };
  }

  async generateSitemap(schoolId: string, tenantId: string) {
    const [school, posts] = await Promise.all([
      this.prisma.school.findFirst({ where: { id: schoolId, tenantId } }),
      this.prisma.blogPost.findMany({ where: { schoolId, tenantId, status: 'PUBLISHED' }, select: { slug: true, updatedAt: true } }),
    ]);
    if (!school) throw new NotFoundException('School not found');
    const baseUrl = `https://${school.code.toLowerCase()}.myschool.app`;
    const urls = [`${baseUrl}/`, `${baseUrl}/admissions`, `${baseUrl}/contact`, `${baseUrl}/about`,
                  ...posts.map(p => ({ url: `${baseUrl}/news/${p.slug}`, lastmod: p.updatedAt.toISOString() }))];
    return { baseUrl, urls, generatedAt: new Date() };
  }
}
