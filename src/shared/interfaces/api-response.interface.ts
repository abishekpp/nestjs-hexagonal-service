import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

export class ErrorResponseDto {
  @ApiProperty({
    example: false,
  })
  success!: false;

  @ApiProperty({
    example: 400,
  })
  statusCode!: number;

  @ApiProperty({
    example: 'Invalid request data',
  })
  message!: string | string[];

  @ApiProperty({
    example: 'BAD_REQUEST',
  })
  errorCode!: string;

  @ApiPropertyOptional({
    example: {
      field: 'email',
    },
  })
  details?: unknown;
}

export const successResponse = <T>(message: string, data: T): ApiSuccessResponse<T> => {
  return {
    success: true,
    message,
    data,
  };
};
