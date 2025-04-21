import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, ObjectLiteral } from 'typeorm';
import { ListsService } from './lists.service';
import { List } from './list.entity';
import { Board } from '../boards/board.entity';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

type MockRepository<T extends ObjectLiteral = any> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

describe('ListsService', () => {
  let listsService: ListsService;
  let listRepository: MockRepository<List>;
  let boardRepository: MockRepository<Board>;

  const userId = 'user-123';
  const boardId = 'board-123';

  const mockBoard = {
    id: boardId,
    title: 'Test Board',
    description: 'Test Description',
    ownerId: userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockList = {
    id: 'list-123',
    title: 'Test List',
    position: 0,
    board: mockBoard,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockListRepository = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  });

  const mockBoardRepository = () => ({
    findOne: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListsService,
        {
          provide: getRepositoryToken(List),
          useFactory: mockListRepository,
        },
        {
          provide: getRepositoryToken(Board),
          useFactory: mockBoardRepository,
        },
      ],
    }).compile();

    listsService = module.get<ListsService>(ListsService);
    listRepository = module.get<MockRepository<List>>(getRepositoryToken(List));
    boardRepository = module.get<MockRepository<Board>>(
      getRepositoryToken(Board),
    );
  });

  describe('findAll', () => {
    it('should return all lists for a board', async () => {
      const mockLists = [mockList];
      boardRepository.findOne!.mockResolvedValue(mockBoard);
      listRepository.find!.mockResolvedValue(mockLists);

      const result = await listsService.findAll(boardId, userId);

      expect(result).toEqual(mockLists);
      expect(boardRepository.findOne).toHaveBeenCalledWith({
        where: { id: boardId },
      });
      expect(listRepository.find).toHaveBeenCalledWith({
        where: { board: { id: boardId } },
        relations: ['board'],
        order: { position: 'ASC' },
      });
    });

    it('should throw NotFoundException if board not found', async () => {
      boardRepository.findOne!.mockResolvedValue(null);

      await expect(listsService.findAll(boardId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if board does not belong to user', async () => {
      const otherUserBoard = { ...mockBoard, ownerId: 'other-user' };
      boardRepository.findOne!.mockResolvedValue(otherUserBoard);

      await expect(listsService.findAll(boardId, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a list if it belongs to a board owned by the user', async () => {
      listRepository.findOne!.mockResolvedValue(mockList);

      const result = await listsService.findOne('list-123', userId);

      expect(result).toEqual(mockList);
      expect(listRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'list-123' },
        relations: ['board'],
      });
    });

    it('should throw NotFoundException if list not found', async () => {
      listRepository.findOne!.mockResolvedValue(null);

      await expect(
        listsService.findOne('non-existent', userId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if list board does not belong to user', async () => {
      const otherUserList = {
        ...mockList,
        board: { ...mockBoard, ownerId: 'other-user' },
      };
      listRepository.findOne!.mockResolvedValue(otherUserList);

      await expect(listsService.findOne('list-123', userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('create', () => {
    it('should create a new list', async () => {
      const createListDto = {
        title: 'New List',
        boardId: boardId,
      };

      boardRepository.findOne!.mockResolvedValue(mockBoard);
      listRepository.findOne!.mockResolvedValue(null); // No existing lists

      const newList = {
        ...createListDto,
        id: 'new-list-id',
        position: 0,
        board: mockBoard,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      };

      listRepository.create!.mockReturnValue(newList);
      listRepository.save!.mockResolvedValue(newList);

      const result = await listsService.create(createListDto, userId);

      expect(result).toEqual(newList);
      expect(boardRepository.findOne).toHaveBeenCalledWith({
        where: { id: createListDto.boardId },
      });
      expect(listRepository.create).toHaveBeenCalledWith({
        ...createListDto,
        position: 0,
      });
      expect(listRepository.save).toHaveBeenCalledWith(newList);
    });

    it('should create a new list with position at the end', async () => {
      const createListDto = {
        title: 'New List',
        boardId: boardId,
      };

      const existingList = {
        ...mockList,
        position: 1,
      };

      boardRepository.findOne!.mockResolvedValue(mockBoard);
      listRepository.findOne!.mockResolvedValue(existingList);

      const newList = {
        ...createListDto,
        id: 'new-list-id',
        position: 2, // Should be positioned after the existing list
        board: mockBoard,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      };

      listRepository.create!.mockReturnValue(newList);
      listRepository.save!.mockResolvedValue(newList);

      const result = await listsService.create(createListDto, userId);

      expect(result).toEqual(newList);
      expect(listRepository.create).toHaveBeenCalledWith({
        ...createListDto,
        position: 2,
      });
    });

    it('should use the provided position if specified', async () => {
      const createListDto = {
        title: 'New List',
        boardId: boardId,
        position: 5,
      };

      boardRepository.findOne!.mockResolvedValue(mockBoard);

      const newList = {
        ...createListDto,
        id: 'new-list-id',
        board: mockBoard,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      };

      listRepository.create!.mockReturnValue(newList);
      listRepository.save!.mockResolvedValue(newList);

      const result = await listsService.create(createListDto, userId);

      expect(result).toEqual(newList);
      expect(listRepository.create).toHaveBeenCalledWith({
        ...createListDto,
        position: 5,
      });
    });

    it('should throw NotFoundException if board not found', async () => {
      const createListDto = {
        title: 'New List',
        boardId: 'non-existent-board',
      };

      boardRepository.findOne!.mockResolvedValue(null);

      await expect(listsService.create(createListDto, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if board does not belong to user', async () => {
      const createListDto = {
        title: 'New List',
        boardId: boardId,
      };

      const otherUserBoard = { ...mockBoard, ownerId: 'other-user' };
      boardRepository.findOne!.mockResolvedValue(otherUserBoard);

      await expect(listsService.create(createListDto, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('update', () => {
    it('should update an existing list', async () => {
      const updateListDto = {
        title: 'Updated List',
      };

      listRepository.findOne!.mockResolvedValue(mockList);

      const updatedList = {
        ...mockList,
        ...updateListDto,
      };

      listRepository.save!.mockResolvedValue(updatedList);

      const result = await listsService.update(
        'list-123',
        updateListDto,
        userId,
      );

      expect(result).toEqual(updatedList);
      expect(listRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'list-123' },
        relations: ['board'],
      });
      expect(listRepository.save).toHaveBeenCalled();
    });
  });

  describe('move', () => {
    it('should update list position', async () => {
      const moveListDto = {
        position: 2,
      };

      // Primeira chamada retorna o mockList original
      listRepository.findOne!.mockResolvedValueOnce(mockList);

      const movedList = {
        ...mockList,
        title: 'Updated List',
        position: moveListDto.position,
      };

      listRepository.save!.mockResolvedValue(movedList);

      // Segunda chamada deve retornar o movedList com position atualizada
      listRepository.findOne!.mockResolvedValueOnce(movedList);

      const result = await listsService.move('list-123', moveListDto, userId);

      expect(result).toEqual(movedList);
      expect(listRepository.save).toHaveBeenCalledWith({
        ...mockList,
        position: moveListDto.position,
      });
    });
  });

  describe('remove', () => {
    it('should remove a list', async () => {
      listRepository.findOne!.mockResolvedValue(mockList);

      await listsService.remove('list-123', userId);

      expect(listRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'list-123' },
        relations: ['board'],
      });
      expect(listRepository.remove).toHaveBeenCalledWith(mockList);
    });
  });
});
