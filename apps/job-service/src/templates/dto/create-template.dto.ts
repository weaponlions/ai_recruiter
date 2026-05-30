import { IsString, IsOptional, IsObject } from 'class-validator';

export class CreateTemplateDto {
  @IsString() name!: string;
  @IsObject() content!: Record<string, unknown>;
  @IsString() @IsOptional() description?: string;
}
