import { User } from 'src/database/entities';

export class UserResponseDto {
  id: number;
  email: string;
  fullName: string;
  status: number;
  avatar: string;
  phoneNumber: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(user: User) {
    this.id = user.id;
    this.email = user.email;
    this.fullName = user.fullName;
    this.status = user.status;
    this.avatar = user.avatar;
    this.phoneNumber = user.phoneNumber;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }
}
