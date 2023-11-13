import { Exclude, Expose, Transform, Type } from 'class-transformer';

import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

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

  role?: string;
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
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
export { CreateUserRequest, SignInRequest, UserResponse };
export default CreateUserRequest;
