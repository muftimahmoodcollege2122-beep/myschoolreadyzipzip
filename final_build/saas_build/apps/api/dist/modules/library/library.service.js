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
var LibraryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LibraryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
let LibraryService = LibraryService_1 = class LibraryService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(LibraryService_1.name);
    }
    async resolveSchoolId(tenantId, schoolId) {
        if (schoolId && UUID_RE.test(schoolId))
            return schoolId;
        const school = await this.prisma.school.findFirst({ where: { tenantId }, select: { id: true } });
        return school?.id;
    }
    async listBooks(tenantId, schoolId, page = 1, limit = 20, search, category) {
        const resolved = await this.resolveSchoolId(tenantId, schoolId);
        const where = {
            tenantId,
            ...(resolved && { schoolId: resolved }),
            ...(search && { OR: [{ title: { contains: search, mode: 'insensitive' } }, { author: { contains: search, mode: 'insensitive' } }, { isbn: { contains: search, mode: 'insensitive' } }] }),
            ...(category && { category }),
        };
        const skip = (Number(page) - 1) * Number(limit);
        const [data, total] = await Promise.all([
            this.prisma.libraryBook.findMany({ where, skip, take: Number(limit), orderBy: { title: 'asc' } }),
            this.prisma.libraryBook.count({ where }),
        ]);
        return { data, meta: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) } };
    }
    async createBook(tenantId, schoolId, dto) {
        const resolved = await this.resolveSchoolId(tenantId, schoolId);
        if (!resolved)
            throw new common_1.BadRequestException('School not found');
        return this.prisma.libraryBook.create({
            data: { tenantId, schoolId: resolved, title: dto.title, author: dto.author, isbn: dto.isbn, publisher: dto.publisher, category: dto.category, totalCopies: dto.totalCopies ?? 1, availableCopies: dto.totalCopies ?? 1, shelfLocation: dto.shelfLocation, publishYear: dto.publishYear ? Number(dto.publishYear) : undefined },
        });
    }
    async updateBook(tenantId, id, dto) {
        const book = await this.prisma.libraryBook.findFirst({ where: { id, tenantId } });
        if (!book)
            throw new common_1.NotFoundException('Book not found');
        return this.prisma.libraryBook.update({ where: { id }, data: { title: dto.title, author: dto.author, category: dto.category, shelfLocation: dto.shelfLocation, publisher: dto.publisher, totalCopies: dto.totalCopies ? Number(dto.totalCopies) : undefined } });
    }
    async deleteBook(tenantId, id) {
        const book = await this.prisma.libraryBook.findFirst({ where: { id, tenantId } });
        if (!book)
            throw new common_1.NotFoundException('Book not found');
        await this.prisma.libraryBook.delete({ where: { id } });
        return { success: true };
    }
    async issueBook(tenantId, bookId, userId, dueDays = 14) {
        const book = await this.prisma.libraryBook.findFirst({ where: { id: bookId, tenantId } });
        if (!book)
            throw new common_1.NotFoundException('Book not found');
        if (book.availableCopies <= 0)
            throw new common_1.BadRequestException('No copies available');
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + dueDays);
        const [issue] = await this.prisma.$transaction([
            this.prisma.bookIssue.create({ data: { bookId, userId, tenantId, dueDate } }),
            this.prisma.libraryBook.update({ where: { id: bookId }, data: { availableCopies: book.availableCopies - 1 } }),
        ]);
        return issue;
    }
    async returnBook(tenantId, issueId) {
        const issue = await this.prisma.bookIssue.findFirst({ where: { id: issueId, tenantId }, include: { book: true } });
        if (!issue)
            throw new common_1.NotFoundException('Issue record not found');
        if (issue.returnedAt)
            throw new common_1.BadRequestException('Already returned');
        const overdueDays = Math.max(0, Math.floor((Date.now() - issue.dueDate.getTime()) / 86400000));
        const fineAmount = overdueDays * 5;
        await this.prisma.$transaction([
            this.prisma.bookIssue.update({ where: { id: issueId }, data: { returnedAt: new Date(), fineAmount: fineAmount > 0 ? fineAmount : null } }),
            this.prisma.libraryBook.update({ where: { id: issue.bookId }, data: { availableCopies: { increment: 1 } } }),
        ]);
        return { success: true, overdueDays, fineAmount };
    }
    async listIssues(tenantId, returned, page = 1, limit = 20) {
        const where = { tenantId, ...(returned === false ? { returnedAt: null } : returned === true ? { NOT: { returnedAt: null } } : {}) };
        const skip = (Number(page) - 1) * Number(limit);
        const [data, total] = await Promise.all([
            this.prisma.bookIssue.findMany({ where, skip, take: Number(limit), orderBy: { issuedAt: 'desc' }, include: { book: { select: { title: true, author: true } } } }),
            this.prisma.bookIssue.count({ where }),
        ]);
        return { data, meta: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) } };
    }
    async getCategories(tenantId) {
        const books = await this.prisma.libraryBook.findMany({ where: { tenantId }, select: { category: true }, distinct: ['category'] });
        return books.map(b => b.category);
    }
    async getStats(tenantId) {
        const [totalBooks, totalIssued, overdue] = await Promise.all([
            this.prisma.libraryBook.aggregate({ where: { tenantId }, _sum: { totalCopies: true, availableCopies: true } }),
            this.prisma.bookIssue.count({ where: { tenantId, returnedAt: null } }),
            this.prisma.bookIssue.count({ where: { tenantId, returnedAt: null, dueDate: { lt: new Date() } } }),
        ]);
        return { totalBooks: totalBooks._sum.totalCopies ?? 0, availableCopies: totalBooks._sum.availableCopies ?? 0, totalIssued, overdue };
    }
};
exports.LibraryService = LibraryService;
exports.LibraryService = LibraryService = LibraryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LibraryService);
//# sourceMappingURL=library.service.js.map