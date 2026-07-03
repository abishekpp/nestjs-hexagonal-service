import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The unique identifier of the user',
  })
  id!: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'The name of the user',
  })
  name!: string;

  @ApiProperty({
    example: 'johndoe@example.com',
    description: 'The email address of the user',
  })
  email!: string;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: 'The date and time when the user was created',
  })
  createdAt!: string;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: 'The date and time when the user was last updated',
  })
  updatedAt!: string;
}
