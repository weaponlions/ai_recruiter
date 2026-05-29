import { PartialType } from '@nestjs/mapped-types';
import { CreateCandidateDto } from './create-candidate.dto';
import { IsOptional, IsString, IsIn } from 'class-validator';

export class UpdateCandidateDto extends PartialType(CreateCandidateDto) {
  @IsOptional()
  @IsString()
  resumeUrl?: string;

  @IsOptional()
  @IsIn(['PENDING', 'GRANTED', 'REVOKED'])
  consentStatus?: string;
}
