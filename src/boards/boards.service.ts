import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board } from './board.entity';
import {
  BoardSearchDto,
  CreateBoardDto,
  UpdateBoardDto,
} from './board.schemas';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Board)
    private boardsRepository: Repository<Board>,
  ) {}

  async findAllByUser(userId: string): Promise<Board[]> {
    return this.boardsRepository.find({
      where: { owner: { id: userId } },
      order: { createdAt: 'DESC' },
      relations: ['owner', 'lists'],
    });
  }

  async findAll(searchQuery: BoardSearchDto): Promise<Board[]> {
    const resultQuery = this.boardsRepository.createQueryBuilder('board');

    if (searchQuery.userId) {
      resultQuery.andWhere('board.owner.id = :userId', {
        userId: searchQuery.userId,
      });
    }

    if (searchQuery.title) {
      resultQuery.andWhere('board.title LIKE :title', {
        title: `%${searchQuery.title}%`,
      });
    }

    if (searchQuery.description) {
      resultQuery.andWhere('board.description LIKE :description', {
        description: `%${searchQuery.description}%`,
      });
    }

    if (searchQuery.page) {
      resultQuery.skip((searchQuery.page - 1) * (searchQuery.limit || 10));
    }

    if (searchQuery.limit) {
      resultQuery.take(searchQuery.limit);
    }

    return resultQuery.getMany();
  }

  async findOne(id: string, userId: string): Promise<Board> {
    const board = await this.boardsRepository.findOne({
      where: { id },
      relations: ['owner', 'lists'],
    });

    if (!board) {
      throw new NotFoundException(`Board with ID ${id} not found`);
    }

    // Check if the user has access to this board
    if (board.owner.id !== userId) {
      throw new ForbiddenException('You do not have access to this board');
    }

    return board;
  }

  async create(createBoardDto: CreateBoardDto, userId: string): Promise<Board> {
    const board = this.boardsRepository.create({
      ...createBoardDto,
      owner: { id: userId },
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
