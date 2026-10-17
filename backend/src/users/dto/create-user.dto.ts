import { IsEmail, IsIn, IsString, MinLength } from 'class-validator';
import { UserRole } from '../user-role.enum';

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(2)
  fullName!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsIn([UserRole.Manager, UserRole.Member])
  role!: UserRole.Manager | UserRole.Member;
}
