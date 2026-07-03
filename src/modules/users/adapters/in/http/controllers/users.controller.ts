import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateUserUseCase } from 'src/modules/users/application/use-cases/create-user.use-case';
import { CreateUserRequestDto } from '../dto/requests/create-user.request';
import { ErrorResponseDto, successResponse } from 'src/shared/interfaces/api-response.interface';
import { GetUserByIdUseCase } from 'src/modules/users/application/use-cases/get-user-by-id.use-case';
import { GetAllUsersUseCase } from 'src/modules/users/application/use-cases/get-all-users.use-case';
import { UpdateUserRequestDto } from '../dto/requests/update-user.request';
import { UpdateUserUseCase } from 'src/modules/users/application/use-cases/update-user.use-case';
import { toResponse, toResponseList } from '../mappers/user-http.mapper';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserResponseDto } from '../dto/responses/user.response';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@Controller('users')
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly getAllUsersUseCase: GetAllUsersUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
  ) {}

  @Post()
  @ApiBody({ type: CreateUserRequestDto })
  @ApiCreatedResponse({ description: 'User created successfully', type: ErrorResponseDto })
  @ApiConflictResponse({
    description: 'User with the given email already exists',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error', type: ErrorResponseDto })
  async createUser(@Body() body: CreateUserRequestDto) {
    const user = await this.createUserUseCase.execute({
      name: body.name,
      email: body.email,
    });

    return successResponse('User created successfully!', toResponse(user));
  }

  @Get(':id')
  @ApiOkResponse({
    description: 'User fetched successfully',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  async getUserById(@Param('id') id: string) {
    const user = await this.getUserByIdUseCase.execute(id);

    return successResponse('User fetched successfully', toResponse(user));
  }

  @Get()
  @ApiOkResponse({
    description: 'User fetched successfully',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  async getAllUsers() {
    const users = await this.getAllUsersUseCase.execute();

    return successResponse('All users fetched successfully!', toResponseList(users));
  }

  @Patch(':id')
  @ApiBody({ type: UpdateUserRequestDto })
  @ApiOkResponse({ description: 'User updated successfully' })
  @ApiNotFoundResponse({ description: 'User not found', type: ErrorResponseDto })
  @ApiConflictResponse({
    description: 'User with the given email already exists',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({ description: 'Internal server error', type: ErrorResponseDto })
  async updateUser(@Param('id') id: string, @Body() body: UpdateUserRequestDto) {
    const user = await this.updateUserUseCase.execute({
      id,
      name: body.name,
      email: body.email,
    });

    return successResponse('User updated successfully!', toResponse(user));
  }
}
