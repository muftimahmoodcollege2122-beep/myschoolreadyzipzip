import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AttendanceReportQueryDto {
  @ApiProperty() @IsString() startDate: string;
  @ApiProperty() @IsString() endDate: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() classId?: string;
}
