import { IsString, IsEmail, MinLength, MaxLength, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTenantDto {
  @ApiProperty({ example: 'Springfield Elementary School' })
  @IsString() @MinLength(3) @MaxLength(200)
  schoolName: string;

  @ApiProperty({ example: 'admin@springfield.edu' })
  @IsEmail()
  adminEmail: string;

  @ApiProperty()
  @IsString() @MinLength(8)
  adminPassword: string;

  @ApiProperty({ example: 'John' })
  @IsString() @MinLength(1)
  adminFirstName: string;

  @ApiProperty({ example: 'Smith' })
  @IsString() @MinLength(1)
  adminLastName: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  adminPhone?: string;

  @ApiPropertyOptional({ example: 'America/New_York' })
  @IsOptional() @IsString()
  timezone?: string;

  @ApiPropertyOptional({ example: 'en' })
  @IsOptional() @IsString()
  locale?: string;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional() @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: '2024-2025' })
  @IsOptional() @IsString()
  academicYear?: string;

  @ApiPropertyOptional({ example: 'us-east-1', description: 'AWS region for data residency' })
  @IsOptional() @IsString()
  dataRegion?: string;

  @ApiPropertyOptional({ example: '+1 234 567 8900' })
  @IsOptional() @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  address?: Record<string, string>;

  @ApiPropertyOptional({ example: 'STARTER', enum: ['STARTER', 'GROWTH', 'PRO', 'ENTERPRISE'] })
  @IsOptional() @IsIn(['STARTER', 'GROWTH', 'PRO', 'ENTERPRISE'])
  plan?: string;

  @ApiPropertyOptional({ example: 'School' })
  @IsOptional() @IsString()
  institutionType?: string;

  @ApiPropertyOptional({ example: 'Karachi' })
  @IsOptional() @IsString()
  city?: string;
}
