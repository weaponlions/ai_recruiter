import { IsString, IsOptional, IsEnum, IsUUID, MinLength } from 'class-validator';

export enum JobType { FULL_TIME = 'FULL_TIME', PART_TIME = 'PART_TIME', CONTRACT = 'CONTRACT', INTERNSHIP = 'INTERNSHIP' }

export class CreateJobDto {
  @IsString() @MinLength(3)
  title: string;

  @IsString() @MinLength(10)
  description: string;

  @IsString() @IsOptional()
  requirements?: string;

  @IsString() @IsOptional()
  location?: string;

  @IsEnum(JobType) @IsOptional()
  type?: JobType;

  @IsUUID() @IsOptional()
  templateId?: string;
}
