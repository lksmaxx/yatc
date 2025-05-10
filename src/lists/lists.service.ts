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
import {
  CreateListDto,
  UpdateListDto,
  MoveListDto,
  ListSearchDto,
} from './list.schemas';

@Injectable()
export class ListsService {
  constructor(
    @InjectRepository(List)
    private listsRepository: Repository<List>,
    @InjectRepository(Board)
    private boardsRepository: Repository<Board>,
  ) {}

  async findAllByBoard(boardId: string, userId: string): Promise<List[]> {
    const resultQuery = this.listsRepository
      .createQueryBuilder('list')
      .leftJoinAndSelect('list.tasks', 'task')
      .leftJoin('list.board', 'board')
      .leftJoin('board.owner', 'owner')

      .where('list.board.id = :boardId', { boardId })
      .andWhere('owner.id = :userId', { userId })
      .orderBy('list.position', 'ASC')
      .addOrderBy('task.position', 'ASC');

    return resultQuery.getMany();
  }

  async findAll(searchQuery: ListSearchDto): Promise<List[]> {
    const resultQuery = this.listsRepository
      .createQueryBuilder('list')
      .leftJoinAndSelect('list.tasks', 'task')
      .orderBy('list.position', 'ASC')
      .addOrderBy('task.position', 'ASC');

    if (searchQuery.boardId) {
      resultQuery.andWhere('list.board.id = :boardId', {
        boardId: searchQuery.boardId,
      });
    }

    if (searchQuery.title) {
      resultQuery.andWhere('list.title LIKE :title', {
        title: `%${searchQuery.title}%`,
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

  async findOne(id: string, userId: string): Promise<List> {
    const list = await this.listsRepository.findOne({
      where: { id },
      relations: {
        board: { owner: true }, // Load the board and its owner
      },
    });

    if (!list) {
      throw new NotFoundException(`List with ID ${id} not found`);
    }

    // Check if the user has access to the board
    if (list.board.owner.id !== userId) {
      throw new ForbiddenException('You do not have access to this list');
    }

    return list;
  }

  async create(createListDto: CreateListDto, userId: string): Promise<List> {
    // Verify board exists and user has access
    const board = await this.boardsRepository.findOne({
      where: { id: createListDto.board.id },
      relations: ['owner'],
    });

    if (!board) {
      throw new NotFoundException(
        `Board with ID ${createListDto.board.id} not found`,
      );
    }

    if (board.owner.id !== userId) {
      throw new ForbiddenException('You do not have access to this board');
    }

    // Get the highest position for the current board to place the new list at the end
    const highestPositionList = await this.listsRepository.findOne({
      where: { board: { id: createListDto.board.id } },
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

    if (list.position === position) {
      return list;
    }

    if (list.position < position) {
      await this.listsRepository
        .createQueryBuilder('list')
        .update()
        .set({ position: () => 'position - 1' })
        .where('board_id = :boardId', { boardId: list.board.id })
        .andWhere('position <= :position', { position })
        .andWhere('position > :prevPosition', { prevPosition: list.position })
        .execute();
    } else {
      await this.listsRepository
        .createQueryBuilder('list')
        .update()
        .set({ position: () => 'position + 1' })
        .where('board_id = :boardId', { boardId: list.board.id })
        .andWhere('position >= :position', { position })
        .andWhere('position < :nextPosition', { nextPosition: list.position })
        .execute();
    }

    const countLists = await this.listsRepository.count({
      where: { board: { id: list.board.id } },
    });

    if (position >= countLists) {
      throw new BadRequestException('Position is out of range');
    }

    list.position = position;
    return this.listsRepository.save(list);
  }

  async remove(id: string, userId: string): Promise<void> {
    const list = await this.findOne(id, userId);
    await this.listsRepository.remove(list);
  }
}
