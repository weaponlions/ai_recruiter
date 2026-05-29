import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateApplicationDto {
  @IsUUID() jobId: string;
  @IsUUID() candidateId: string;
  @IsString() @IsOptional() coverLetter?: string;
}
