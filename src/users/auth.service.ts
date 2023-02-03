import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async signup(email: string, password: string) {
    // See if email is in use
    const users = await this.usersService.find(email);
    if (users.length) {
      throw new BadRequestException('Email already in use');
    }

    // Hash the users password
    // Generate a salt
    const salt = randomBytes(8).toString('hex');

    // Hash the salt and passowrd together
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    //Join the hashed result and salt together
    const hashedPassword = salt + '.' + hash.toString('hex');

    // Create a new user and save it
    const user = await this.usersService.create(email, hashedPassword);

    return user;
  }

  async signin(email: string, password: string) {
    const [existingUser] = await this.usersService.find(email);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    const [salt, storedHash] = existingUser.password.split('.');

    const hash = (await scrypt(password, salt, 32)) as Buffer;

    if (hash.toString('hex') !== storedHash) {
      throw new BadRequestException('incorrect username or password');
    }
    return existingUser;
  }
}
