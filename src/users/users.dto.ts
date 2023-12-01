import { Exclude, Expose, Type } from 'class-transformer';

import { IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator';

class CreateUserRequest {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsEmail({}, { message: 'Invalid email' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @IsOptional()
  @IsString()
  role: string;

  @IsOptional()
  @IsString()
  avatar: string;

  @Type(() => Date)
  @IsNotEmpty({ message: 'Date of birth is required' })
  dob: Date;
}
class SignInRequest {
  @IsEmail({}, { message: 'Invalid email' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  constructor(email: string, password: string) {
    this.email = email;
    this.password = password;
  }
}

class UpdateUserRequest {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  avatar: string;

  @IsOptional()
  @Type(() => Date)
  @IsNotEmpty({ message: 'Date of birth is required' })
  dob: Date;

  @IsOptional()
  @IsString()
  bio: string;

  @IsOptional()
  @IsString()
  phoneNumber: string;
}

@Exclude()
class UserResponse {
  @Expose()
  id: number;
  @Expose()
  name: string;
  @Expose()
  email: string;

  @Expose()
  role: string;

  @Expose()
  avatar: string;

  @Expose()
  bio: string;

  @Expose()
  phoneNumber: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
export { CreateUserRequest, SignInRequest, UserResponse, UpdateUserRequest };
export default CreateUserRequest;
