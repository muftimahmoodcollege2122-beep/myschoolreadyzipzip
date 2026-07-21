import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FinanceService } from './finance.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Finance') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Controller('finance')
export class FinanceController {
  constructor(private readonly svc: FinanceService) {}
  @Post('expenses') @Roles('SCHOOL_ADMIN','STAFF') createExpense(@Body() dto: any, @TenantId() tid: string, @CurrentUser() u: any) { return this.svc.createExpense(dto, tid, u.sub); }
  @Get('expenses') @Roles('SCHOOL_ADMIN') listExpenses(@TenantId() tid: string, @Query('schoolId') sid?: string, @Query('category') cat?: string, @Query('from') from?: string, @Query('to') to?: string, @Query('status') status?: string) { return this.svc.listExpenses(tid, sid, cat, from, to, status); }
  @Put('expenses/:id/approve') @Roles('SCHOOL_ADMIN') approveExpense(@Param('id') id: string, @TenantId() tid: string, @CurrentUser() u: any) { return this.svc.approveExpense(id, tid, u.sub); }
  @Put('expenses/:id/reject') @Roles('SCHOOL_ADMIN') rejectExpense(@Param('id') id: string, @TenantId() tid: string) { return this.svc.rejectExpense(id, tid); }
  @Get('expenses/summary') @Roles('SCHOOL_ADMIN') getExpenseSummary(@TenantId() tid: string, @Query('schoolId') sid: string, @Query('period') period: string) { return this.svc.getExpenseSummary(tid, sid, period); }
  @Post('budgets') @Roles('SCHOOL_ADMIN') setBudget(@Body() dto: any, @TenantId() tid: string, @CurrentUser() u: any) { return this.svc.setBudget(dto, tid, u.sub); }
  @Get('budgets') @Roles('SCHOOL_ADMIN') listBudgets(@TenantId() tid: string, @Query('schoolId') sid: string, @Query('period') period?: string) { return this.svc.listBudgets(tid, sid, period); }
  @Get('budgets/analysis') @Roles('SCHOOL_ADMIN') getBudgetAnalysis(@TenantId() tid: string, @Query('schoolId') sid: string, @Query('period') period: string) { return this.svc.getBudgetAnalysis(tid, sid, period); }
  @Post('cashbook') @Roles('SCHOOL_ADMIN','STAFF') addCashbookEntry(@Body() dto: any, @TenantId() tid: string, @CurrentUser() u: any) { return this.svc.addCashbookEntry(dto, tid, u.sub); }
  @Get('cashbook') @Roles('SCHOOL_ADMIN') getCashbook(@TenantId() tid: string, @Query('schoolId') sid: string, @Query('from') from: string, @Query('to') to: string) { return this.svc.getCashbook(tid, sid, from, to); }
  @Get('dashboard') @Roles('SCHOOL_ADMIN') getDashboard(@TenantId() tid: string, @Query('schoolId') sid: string) { return this.svc.getFinancialDashboard(tid, sid); }
  @Get('income-vs-expense') @Roles('SCHOOL_ADMIN') getIncomeVsExpense(@TenantId() tid: string, @Query('schoolId') sid: string, @Query('year') year: string) { return this.svc.getIncomeVsExpense(tid, sid, year); }
  @Post('tax/calculate') @Roles('SCHOOL_ADMIN') calculateTax(@Body() dto: any) { return this.svc.calculateTax(dto.amount, dto.taxRate, dto.taxType); }
}
