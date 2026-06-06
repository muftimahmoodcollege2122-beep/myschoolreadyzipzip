import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { QuestionBankService } from './question-bank.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Question Bank') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Controller('question-bank')
export class QuestionBankController {
  constructor(private readonly svc: QuestionBankService) {}
  @Post('banks') @Roles('SCHOOL_ADMIN','TEACHER') createBank(@Body() dto: any, @TenantId() tid: string, @CurrentUser() u: any) { return this.svc.createBank(dto, tid, u.sub); }
  @Get('banks') @Roles('SCHOOL_ADMIN','TEACHER') listBanks(@TenantId() tid: string, @Query('schoolId') sid?: string, @Query('subjectId') subId?: string) { return this.svc.listBanks(tid, sid, subId); }
  @Post('questions') @Roles('SCHOOL_ADMIN','TEACHER') createQuestion(@Body() dto: any, @TenantId() tid: string, @CurrentUser() u: any) { return this.svc.createQuestion(dto, tid, u.sub); }
  @Get('questions') @Roles('SCHOOL_ADMIN','TEACHER') listQuestions(@TenantId() tid: string, @Query('bankId') bid?: string, @Query('type') t?: string, @Query('difficulty') d?: string, @Query('subjectId') sid?: string, @Query('search') s?: string) { return this.svc.listQuestions(tid, bid, t, d, sid, s); }
  @Put('questions/:id') @Roles('SCHOOL_ADMIN','TEACHER') updateQuestion(@Param('id') id: string, @Body() dto: any, @TenantId() tid: string) { return this.svc.updateQuestion(id, dto, tid); }
  @Delete('questions/:id') @Roles('SCHOOL_ADMIN','TEACHER') deleteQuestion(@Param('id') id: string, @TenantId() tid: string) { return this.svc.deleteQuestion(id, tid); }
  @Post('generate-paper') @Roles('SCHOOL_ADMIN','TEACHER') generatePaper(@Body() dto: any, @TenantId() tid: string) { return this.svc.generatePaper(dto, tid); }
  @Get('banks/:id/stats') @Roles('SCHOOL_ADMIN','TEACHER') getBankStats(@Param('id') id: string, @TenantId() tid: string) { return this.svc.getBankStats(id, tid); }
  @Post('online-exam/:examId/start') @Roles('STUDENT') startExam(@Param('examId') examId: string, @TenantId() tid: string, @CurrentUser() u: any) { return this.svc.startOnlineExam(examId, u.sub, tid); }
  @Post('online-exam/sessions/:sessionId/answer') @Roles('STUDENT') submitAnswer(@Param('sessionId') sid: string, @Body() dto: any, @TenantId() tid: string) { return this.svc.submitAnswer(sid, dto.questionId, dto.answer, tid); }
  @Post('online-exam/sessions/:sessionId/submit') @Roles('STUDENT') submitExam(@Param('sessionId') sid: string, @TenantId() tid: string) { return this.svc.submitExam(sid, tid); }
  @Get('online-exam/sessions/:sessionId') @Roles('SCHOOL_ADMIN','TEACHER','STUDENT') getSession(@Param('sessionId') sid: string, @TenantId() tid: string) { return this.svc.getSessionResults(sid, tid); }
}
