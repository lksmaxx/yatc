import { ApiProperty } from '@nestjs/swagger';
import { ApiZodSchema } from '../common/utils/swagger.utils';
import { updateUserSchema } from './user.schemas';

@ApiZodSchema(updateUserSchema)
export class UpdateUserSwaggerDto {
  @ApiProperty({
    example: 'John Doe Updated',
    description: 'Novo nome do usuário',
    required: false,
  })
  name?: string;

  @ApiProperty({
    example: 'newpassword123',
    description: 'Nova senha do usuário',
    required: false,
  })
  password?: string;
}

export class UserResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174001' })
  id: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: '2023-04-21T10:30:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2023-04-21T10:30:00Z' })
  updatedAt: Date;
}
