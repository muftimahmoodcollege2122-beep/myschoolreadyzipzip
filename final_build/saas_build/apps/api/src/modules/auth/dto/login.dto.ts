import { IsEmail, IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@school.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePassword123!' })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;

  @ApiPropertyOptional({ example: 'demo' })
  @IsString()
  @IsOptional()
  tenantSlug?: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}

export class LogoutDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'Beacon House School System' })
  @IsString() @MinLength(3) @MaxLength(200)
  schoolName: string;

  @ApiProperty({ example: 'Dr. Ahmed Khan' })
  @IsString() @MinLength(2) @MaxLength(100)
  principalName: string;

  @ApiProperty({ example: 'principal@school.edu.pk' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+92-300-1234567' })
  @IsString()
  phone: string;

  @ApiPropertyOptional({ example: 'Pakistan' })
  @IsOptional() @IsString()
  country?: string;

  @ApiPropertyOptional({ example: '501-1000' })
  @IsOptional() @IsString()
  studentCount?: string;

  @ApiPropertyOptional({ example: 'beaconhouse' })
  @IsOptional() @IsString()
  domain?: string;

  @ApiPropertyOptional({ example: 'Professional' })
  @IsOptional() @IsString()
  plan?: string;
}
