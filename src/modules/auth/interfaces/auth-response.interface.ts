import { UserResponseDto } from '../../user/dto';

export interface AuthData {
  accessToken: string;
  user: UserResponseDto;
}
