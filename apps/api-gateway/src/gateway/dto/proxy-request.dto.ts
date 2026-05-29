import { IsString, IsOptional, IsObject } from 'class-validator';

export class ProxyRequestDto {
  @IsString()
  method: string;

  @IsString()
  path: string;

  @IsOptional()
  @IsObject()
  body?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  query?: Record<string, string>;
}
