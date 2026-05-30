import { IsEmail, IsString, IsIn } from 'class-validator';

export class InviteUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsIn(['ADMIN', 'HR_MANAGER', 'RECRUITER', 'INTERVIEWER', 'VIEWER'])
  role!: string;
}
