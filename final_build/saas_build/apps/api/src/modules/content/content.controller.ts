import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ContentService } from './content.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Content') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Controller('content')
export class ContentController {
  constructor(private readonly svc: ContentService) {}
  @Post('posts') @Roles('SCHOOL_ADMIN','TEACHER') createPost(@Body() dto: any, @TenantId() tid: string, @CurrentUser() u: any) { return this.svc.createPost(dto, tid, u.sub); }
  @Get('posts') @Roles('SCHOOL_ADMIN','TEACHER','STUDENT','PARENT') listPosts(@TenantId() tid: string, @Query('schoolId') sid?: string, @Query('category') cat?: string, @Query('status') status?: string, @Query('search') search?: string, @Query('page') page?: string) { return this.svc.listPosts(tid, sid, cat, status, search, page ? +page : 1); }
  @Get('posts/:id') @Roles('SCHOOL_ADMIN','TEACHER','STUDENT','PARENT') getPost(@Param('id') id: string, @TenantId() tid: string) { return this.svc.getPost(id, tid); }
  @Put('posts/:id') @Roles('SCHOOL_ADMIN','TEACHER') updatePost(@Param('id') id: string, @Body() dto: any, @TenantId() tid: string) { return this.svc.updatePost(id, dto, tid); }
  @Delete('posts/:id') @Roles('SCHOOL_ADMIN') deletePost(@Param('id') id: string, @TenantId() tid: string) { return this.svc.deletePost(id, tid); }
  @Post('albums') @Roles('SCHOOL_ADMIN','TEACHER') createAlbum(@Body() dto: any, @TenantId() tid: string, @CurrentUser() u: any) { return this.svc.createAlbum(dto, tid, u.sub); }
  @Get('albums') @Roles('SCHOOL_ADMIN','TEACHER','STUDENT','PARENT') listAlbums(@TenantId() tid: string, @Query('schoolId') sid?: string) { return this.svc.listAlbums(tid, sid); }
  @Post('albums/:albumId/items') @Roles('SCHOOL_ADMIN','TEACHER') addGalleryItem(@Param('albumId') albumId: string, @Body() dto: any, @TenantId() tid: string) { return this.svc.addGalleryItem(albumId, dto, tid); }
  @Get('albums/:albumId/items') @Roles('SCHOOL_ADMIN','TEACHER','STUDENT','PARENT') getAlbumItems(@Param('albumId') albumId: string, @TenantId() tid: string) { return this.svc.getAlbumItems(albumId, tid); }
  @Delete('albums/:albumId/items/:id') @Roles('SCHOOL_ADMIN') deleteGalleryItem(@Param('id') id: string, @TenantId() tid: string) { return this.svc.deleteGalleryItem(id, tid); }
  @Delete('albums/:id') @Roles('SCHOOL_ADMIN') deleteAlbum(@Param('id') id: string, @TenantId() tid: string) { return this.svc.deleteAlbum(id, tid); }
  @Get('seo') @Roles('SCHOOL_ADMIN') getSeoData(@TenantId() tid: string, @Query('schoolId') sid: string) { return this.svc.getSeoData(sid, tid); }
  @Get('sitemap') @Roles('SCHOOL_ADMIN') generateSitemap(@TenantId() tid: string, @Query('schoolId') sid: string) { return this.svc.generateSitemap(sid, tid); }
}
