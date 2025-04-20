import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board } from './board.entity';
import { CreateBoardDto, UpdateBoardDto } from './board.schemas';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Board)
    private boardsRepository: Repository<Board>,
  ) {}

  async findAllByUser(userId: string): Promise<Board[]> {
    return this.boardsRepository.find({
      where: { ownerId: userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Board> {
    const board = await this.boardsRepository.findOne({
      where: { id },
    });

    if (!board) {
      throw new NotFoundException(`Board with ID ${id} not found`);
    }

    // Check if the user has access to this board
    if (board.ownerId !== userId) {
      throw new ForbiddenException('You do not have access to this board');
    }

    return board;
  }

  async create(createBoardDto: CreateBoardDto, userId: string): Promise<Board> {
    const board = this.boardsRepository.create({
      ...createBoardDto,
      ownerId: userId,
    });

    return this.boardsRepository.save(board);
  }

  async update(
    id: string,
    updateBoardDto: UpdateBoardDto,
    userId: string,
  ): Promise<Board> {
    const board = await this.findOne(id, userId);

    // Update only the provided fields
    Object.assign(board, updateBoardDto);

    return this.boardsRepository.save(board);
  }

  async remove(id: string, userId: string): Promise<void> {
    const board = await this.findOne(id, userId);
    await this.boardsRepository.remove(board);
  }
}
