import { IsString, IsEmail, IsOptional, IsArray } from 'class-validator';
export class CreateTeacherDto {
  @IsEmail() email: string;
  @IsString() firstName: string;
  @IsString() lastName: string;
  @IsString() employeeId: string;
  @IsString() joiningDate: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() gender?: string;
  @IsOptional() @IsString() departmentId?: string;
  @IsOptional() @IsArray() qualifications?: any[];
  @IsOptional() @IsArray() specializations?: string[];
}
