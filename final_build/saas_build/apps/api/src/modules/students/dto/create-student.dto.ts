import { IsString, IsEmail, IsOptional, IsDateString, IsEnum, IsUUID, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender } from '@prisma/client';

export class CreateStudentDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  lastName: string;

  @ApiProperty({ example: 'john.doe@school.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'ADM-2024-001' })
  @IsString()
  @MaxLength(50)
  admissionNo: string;

  @ApiProperty({ example: 'A001' })
  @IsString()
  @MaxLength(20)
  rollNumber: string;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  admissionDate: string;

  @ApiPropertyOptional({ example: '2006-05-20' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ enum: Gender })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'O+' })
  @IsOptional()
  @IsString()
  bloodGroup?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  sectionId?: string;

  @ApiProperty({ example: '2024-2025' })
  @IsString()
  academicYear: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  transportId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  hostelId?: string;
}
