import { ApiProperty } from '@nestjs/swagger';
import { LoginSchema, RegisterSchema } from './auth.dto';
import { ApiZodSchema } from '../../common/utils/swagger.utils';

@ApiZodSchema(LoginSchema)
export class LoginSwaggerDto {
  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'senha123' })
  password: string;
}

@ApiZodSchema(RegisterSchema)
export class RegisterSwaggerDto {
  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'senha123' })
  password: string;
}

export class AuthResponseDto {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
  })
  accessToken: string;

  @ApiProperty({
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'John Doe',
      email: 'user@example.com',
    },
  })
  user: {
    id: string;
    name: string;
    email: string;
  };
}
