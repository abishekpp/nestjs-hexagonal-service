import { UserOutput } from 'src/modules/users/application/dto/outputs/user.output';
import { UserResponseDto } from '../dto/responses/user.response';

export const toResponse = (user: UserOutput): UserResponseDto => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
};

export const toResponseList = (users: UserOutput[]): UserResponseDto[] => {
  return users.map((user) => toResponse(user));
};
