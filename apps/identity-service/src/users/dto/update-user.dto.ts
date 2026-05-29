import {
  IsString,
  IsOptional,
  IsBoolean,
  IsIn,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @IsIn(['ADMIN', 'HR_MANAGER', 'RECRUITER', 'INTERVIEWER', 'VIEWER'])
  role?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
