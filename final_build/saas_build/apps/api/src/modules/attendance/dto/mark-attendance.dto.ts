import { IsUUID, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AttendanceStatus } from '@prisma/client';

export class MarkAttendanceDto {
  @ApiProperty() @IsUUID() studentId: string;
  @ApiProperty({ enum: AttendanceStatus }) @IsEnum(AttendanceStatus) status: AttendanceStatus;
  @ApiProperty({ required: false }) @IsOptional() @IsString() remarks?: string;
}
