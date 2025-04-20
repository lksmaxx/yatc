import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { List } from './list.entity';
import { Board } from '../boards/board.entity';
import { CreateListDto, UpdateListDto, MoveListDto } from './list.schemas';

@Injectable()
export class ListsService {
  constructor(
    @InjectRepository(List)
    private listsRepository: Repository<List>,
    @InjectRepository(Board)
    private boardsRepository: Repository<Board>,
  ) {}

  async findAll(boardId: string, userId: string): Promise<List[]> {
    // Verify board exists and user has access
    const board = await this.boardsRepository.findOne({
      where: { id: boardId },
    });

    if (!board) {
      throw new NotFoundException(`Board with ID ${boardId} not found`);
    }

    if (board.ownerId !== userId) {
      throw new ForbiddenException('You do not have access to this board');
    }

    return this.listsRepository.find({
      where: { board: { id: boardId } },
      relations: ['board'],
      order: { position: 'ASC' },
    });
  }

  async findOne(id: string, userId: string): Promise<List> {
    const list = await this.listsRepository.findOne({
      where: { id },
      relations: ['board'],
    });

    if (!list) {
      throw new NotFoundException(`List with ID ${id} not found`);
    }

    // Check if the user has access to the board
    if (list.board.ownerId !== userId) {
      throw new ForbiddenException('You do not have access to this list');
    }

    return list;
  }

  async create(createListDto: CreateListDto, userId: string): Promise<List> {
    // Verify board exists and user has access
    const board = await this.boardsRepository.findOne({
      where: { id: createListDto.boardId },
    });

    if (!board) {
      throw new NotFoundException(
        `Board with ID ${createListDto.boardId} not found`,
      );
    }

    if (board.ownerId !== userId) {
      throw new ForbiddenException('You do not have access to this board');
    }

    // Get the highest position for the current board to place the new list at the end
    const highestPositionList = await this.listsRepository.findOne({
      where: { board: { id: createListDto.boardId } },
      order: { position: 'DESC' },
    });

    const position = highestPositionList ? highestPositionList.position + 1 : 0;

    const list = this.listsRepository.create({
      ...createListDto,
      position:
        createListDto.position !== undefined
          ? createListDto.position
          : position,
    });

    return this.listsRepository.save(list);
  }

  async update(
    id: string,
    updateListDto: UpdateListDto,
    userId: string,
  ): Promise<List> {
    const list = await this.findOne(id, userId);

    // Update only the provided fields
    Object.assign(list, updateListDto);

    return this.listsRepository.save(list);
  }

  async move(
    id: string,
    moveListDto: MoveListDto,
    userId: string,
  ): Promise<List> {
    const list = await this.findOne(id, userId);
    const { position } = moveListDto;

    // Update the position
    list.position = position;
    await this.listsRepository.save(list);

    return this.findOne(id, userId);
  }

  async remove(id: string, userId: string): Promise<void> {
    const list = await this.findOne(id, userId);
    await this.listsRepository.remove(list);
  }
}
