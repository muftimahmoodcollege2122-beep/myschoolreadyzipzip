/**
 * Library service — book catalog and issue/return management.
 * addBook(): adds book to catalog with ISBN, author, shelf location
 * issueBook(): assigns book to a student with due date
 * returnBook(): marks book as returned, calculates fine if overdue
 * searchBooks(): full-text search across title, author, ISBN
 * getOverdueBooks(): list of books past due date for reminder alerts
 */

import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Injectable()
export class LibraryService {
  private readonly logger = new Logger(LibraryService.name);

  constructor(private readonly prisma: PrismaService) {}

  private async resolveSchoolId(tenantId: string, schoolId?: string): Promise<string | undefined> {
    if (schoolId && UUID_RE.test(schoolId)) return schoolId;
    const school = await this.prisma.school.findFirst({ where: { tenantId }, select: { id: true } });
    return school?.id;
  }

  async listBooks(tenantId: string, schoolId: string, page = 1, limit = 20, search?: string, category?: string) {
    const resolved = await this.resolveSchoolId(tenantId, schoolId);
    const where: any = {
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

  async createBook(tenantId: string, schoolId: string, dto: any) {
    const resolved = await this.resolveSchoolId(tenantId, schoolId);
    if (!resolved) throw new BadRequestException('School not found');
    return this.prisma.libraryBook.create({
      data: { tenantId, schoolId: resolved, title: dto.title, author: dto.author, isbn: dto.isbn, publisher: dto.publisher, category: dto.category, totalCopies: dto.totalCopies ?? 1, availableCopies: dto.totalCopies ?? 1, shelfLocation: dto.shelfLocation, publishYear: dto.publishYear ? Number(dto.publishYear) : undefined },
    });
  }

  async updateBook(tenantId: string, id: string, dto: any) {
    const book = await this.prisma.libraryBook.findFirst({ where: { id, tenantId } });
    if (!book) throw new NotFoundException('Book not found');
    return this.prisma.libraryBook.update({ where: { id }, data: { title: dto.title, author: dto.author, category: dto.category, shelfLocation: dto.shelfLocation, publisher: dto.publisher, totalCopies: dto.totalCopies ? Number(dto.totalCopies) : undefined } });
  }

  async deleteBook(tenantId: string, id: string) {
    const book = await this.prisma.libraryBook.findFirst({ where: { id, tenantId } });
    if (!book) throw new NotFoundException('Book not found');
    await this.prisma.libraryBook.delete({ where: { id } });
    return { success: true };
  }

  async issueBook(tenantId: string, bookId: string, userId: string, dueDays = 14) {
    const book = await this.prisma.libraryBook.findFirst({ where: { id: bookId, tenantId } });
    if (!book) throw new NotFoundException('Book not found');
    if (book.availableCopies <= 0) throw new BadRequestException('No copies available');
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + dueDays);
    const [issue] = await this.prisma.$transaction([
      this.prisma.bookIssue.create({ data: { bookId, userId, tenantId, dueDate } }),
      this.prisma.libraryBook.update({ where: { id: bookId }, data: { availableCopies: book.availableCopies - 1 } }),
    ]);
    return issue;
  }

  async returnBook(tenantId: string, issueId: string) {
    const issue = await this.prisma.bookIssue.findFirst({ where: { id: issueId, tenantId }, include: { book: true } });
    if (!issue) throw new NotFoundException('Issue record not found');
    if (issue.returnedAt) throw new BadRequestException('Already returned');
    const overdueDays = Math.max(0, Math.floor((Date.now() - issue.dueDate.getTime()) / 86400000));
    const fineAmount = overdueDays * 5;
    await this.prisma.$transaction([
      this.prisma.bookIssue.update({ where: { id: issueId }, data: { returnedAt: new Date(), fineAmount: fineAmount > 0 ? fineAmount : null } }),
      this.prisma.libraryBook.update({ where: { id: issue.bookId }, data: { availableCopies: { increment: 1 } } }),
    ]);
    return { success: true, overdueDays, fineAmount };
  }

  async listIssues(tenantId: string, returned?: boolean, page = 1, limit = 20) {
    const where: any = { tenantId, ...(returned === false ? { returnedAt: null } : returned === true ? { NOT: { returnedAt: null } } : {}) };
    const skip = (Number(page) - 1) * Number(limit);
    const [data, total] = await Promise.all([
      this.prisma.bookIssue.findMany({ where, skip, take: Number(limit), orderBy: { issuedAt: 'desc' }, include: { book: { select: { title: true, author: true } } } }),
      this.prisma.bookIssue.count({ where }),
    ]);
    return { data, meta: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) } };
  }

  async getCategories(tenantId: string) {
    const books = await this.prisma.libraryBook.findMany({ where: { tenantId }, select: { category: true }, distinct: ['category'] });
    return books.map(b => b.category);
  }

  async getStats(tenantId: string) {
    const [totalBooks, totalIssued, overdue] = await Promise.all([
      this.prisma.libraryBook.aggregate({ where: { tenantId }, _sum: { totalCopies: true, availableCopies: true } }),
      this.prisma.bookIssue.count({ where: { tenantId, returnedAt: null } }),
      this.prisma.bookIssue.count({ where: { tenantId, returnedAt: null, dueDate: { lt: new Date() } } }),
    ]);
    return { totalBooks: totalBooks._sum.totalCopies ?? 0, availableCopies: totalBooks._sum.availableCopies ?? 0, totalIssued, overdue };
  }
}
