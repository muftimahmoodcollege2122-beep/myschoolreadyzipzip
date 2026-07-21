import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { LibraryService } from './library.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';

@ApiTags('Library') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Controller('library')
export class LibraryController {
  constructor(private readonly svc: LibraryService) {}

  @Get('stats') @Roles('SCHOOL_ADMIN','TEACHER')
  stats(@TenantId() tid: string) { return this.svc.getStats(tid); }

  @Get('books') @Roles('SCHOOL_ADMIN','TEACHER','STUDENT')
  list(@TenantId() tid: string, @Query('schoolId') sid: string, @Query('page') p: number, @Query('limit') l: number, @Query('search') s: string, @Query('category') cat: string) {
    return this.svc.listBooks(tid, sid, p, l, s, cat);
  }

  @Get('categories') @Roles('SCHOOL_ADMIN','TEACHER','STUDENT')
  categories(@TenantId() tid: string) { return this.svc.getCategories(tid); }

  @Post('books') @Roles('SCHOOL_ADMIN')
  create(@TenantId() tid: string, @Query('schoolId') sid: string, @Body() dto: any) { return this.svc.createBook(tid, sid, dto); }

  @Put('books/:id') @Roles('SCHOOL_ADMIN')
  update(@TenantId() tid: string, @Param('id') id: string, @Body() dto: any) { return this.svc.updateBook(tid, id, dto); }

  @Delete('books/:id') @Roles('SCHOOL_ADMIN')
  remove(@TenantId() tid: string, @Param('id') id: string) { return this.svc.deleteBook(tid, id); }

  @Post('books/:id/issue') @Roles('SCHOOL_ADMIN','TEACHER')
  issue(@TenantId() tid: string, @Param('id') bookId: string, @Body() dto: any) { return this.svc.issueBook(tid, bookId, dto.userId, dto.dueDays); }

  @Post('issues/:id/return') @Roles('SCHOOL_ADMIN','TEACHER')
  returnBook(@TenantId() tid: string, @Param('id') issueId: string) { return this.svc.returnBook(tid, issueId); }

  @Get('issues') @Roles('SCHOOL_ADMIN','TEACHER')
  issues(@TenantId() tid: string, @Query('returned') returned: string, @Query('page') p: number, @Query('limit') l: number) {
    const ret = returned === 'true' ? true : returned === 'false' ? false : undefined;
    return this.svc.listIssues(tid, ret, p, l);
  }
}
