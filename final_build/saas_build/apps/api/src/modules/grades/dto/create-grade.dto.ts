import { IsString, IsNumber, IsEnum, IsOptional, Min, Max, IsUUID } from 'class-validator';
import { ExamType } from '../../../common/prisma-enums';;
export class CreateGradeDto {
  @IsUUID() studentId: string;
  @IsUUID() classSubjectId: string;
  @IsString() academicYear: string;
  @IsString() term: string;
  @IsEnum(ExamType) assessmentType: ExamType;
  @IsString() title: string;
  @IsNumber() @Min(0) score: number;
  @IsNumber() @Min(1) maxScore: number;
  @IsOptional() @IsNumber() @Min(0) @Max(10) weight?: number;
  @IsOptional() @IsString() remarks?: string;
}
