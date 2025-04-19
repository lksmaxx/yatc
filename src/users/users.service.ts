import { CreateUserDto } from './user.schemas';
import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) // Assuming User is an entity class
    private readonly userRepository: Repository<User>, // Injecting the repository for User entity
  ) {
    // Initialize with some dummy data
  }

  findAll(): Promise<User[]> {
    return this.userRepository.find(); // Fetch all users from the database
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } }); // Fetch a single user by ID from the database
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`); // Throw an exception if user not found
    }
    return user; // Return the found user
  }

  create(payload: CreateUserDto): Promise<User> {
    const model = this.userRepository.create(payload);

    return this.userRepository.save(model); // Save the new user to the database
  }

  async update(id: string, payload: Partial<CreateUserDto>): Promise<User> {
    const user = await this.findOne(id); // Find the user by ID
    Object.assign(user, payload); // Merge the payload into the user object
    return this.userRepository.save(user); // Save the updated user to the database
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id); // Find the user by ID
    await this.userRepository.remove(user); // Remove the user from the database
  }
}
