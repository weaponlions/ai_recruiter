import {
  IsString,
  IsEmail,
  IsOptional,
  IsArray,
  IsIn,
  IsUrl,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCandidateDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  firstName!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  lastName!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsUrl()
  linkedinUrl?: string;

  @IsOptional()
  @IsUrl()
  resumeUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : []))
  tags?: string[] = [];

  @IsOptional()
  @IsIn(['PENDING', 'GRANTED', 'REVOKED'])
  consentStatus?: string = 'PENDING';

  @IsOptional()
  @IsIn(['MANUAL', 'IMPORT', 'API', 'REFERRAL', 'JOB_BOARD'])
  source?: string = 'MANUAL';
}
