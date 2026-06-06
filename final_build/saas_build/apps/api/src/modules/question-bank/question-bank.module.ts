import { Module } from '@nestjs/common';
import { QuestionBankController } from './question-bank.controller';
import { QuestionBankService } from './question-bank.service';
import { PrismaService } from '../../database/prisma.service';

@Module({ controllers: [QuestionBankController], providers: [QuestionBankService, PrismaService], exports: [QuestionBankService] })
export class QuestionBankModule {}
