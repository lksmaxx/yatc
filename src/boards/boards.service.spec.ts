import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, ObjectLiteral } from 'typeorm';
import { BoardsService } from './boards.service';
import { Board } from './board.entity';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

type MockRepository<T extends ObjectLiteral = any> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

describe('BoardsService', () => {
  let boardsService: BoardsService;
  let boardRepository: MockRepository<Board>;

  const userId = 'user-123';
  const mockBoard = {
    id: 'board-123',
    title: 'Test Board',
    description: 'Test Description',
    ownerId: userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockBoardRepository = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardsService,
        {
          provide: getRepositoryToken(Board),
          useFactory: mockBoardRepository,
        },
      ],
    }).compile();

    boardsService = module.get<BoardsService>(BoardsService);
    boardRepository = module.get<MockRepository<Board>>(
      getRepositoryToken(Board),
    );
  });

  describe('findAllByUser', () => {
    it('should return an array of boards', async () => {
      const mockBoards = [mockBoard];
      boardRepository.find!.mockResolvedValue(mockBoards);

      const result = await boardsService.findAllByUser(userId);

      expect(result).toEqual(mockBoards);
      expect(boardRepository.find).toHaveBeenCalledWith({
        where: { ownerId: userId },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a board if it belongs to the user', async () => {
      boardRepository.findOne!.mockResolvedValue(mockBoard);

      const result = await boardsService.findOne('board-123', userId);

      expect(result).toEqual(mockBoard);
      expect(boardRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'board-123' },
      });
    });

    it('should throw NotFoundException if board not found', async () => {
      boardRepository.findOne!.mockResolvedValue(null);

      await expect(
        boardsService.findOne('non-existent', userId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if board does not belong to user', async () => {
      const otherUserBoard = { ...mockBoard, ownerId: 'other-user' };
      boardRepository.findOne!.mockResolvedValue(otherUserBoard);

      await expect(boardsService.findOne('board-123', userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('create', () => {
    it('should create a new board', async () => {
      const createBoardDto = {
        title: 'New Board',
        description: 'New Description',
      };

      const newBoard = {
        ...createBoardDto,
        id: 'new-board-id',
        ownerId: userId,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      };

      boardRepository.create!.mockReturnValue(newBoard);
      boardRepository.save!.mockResolvedValue(newBoard);

      const result = await boardsService.create(createBoardDto, userId);

      expect(result).toEqual(newBoard);
      expect(boardRepository.create).toHaveBeenCalledWith({
        ...createBoardDto,
        ownerId: userId,
      });
      expect(boardRepository.save).toHaveBeenCalledWith(newBoard);
    });
  });

  describe('update', () => {
    it('should update an existing board', async () => {
      const updateBoardDto = {
        title: 'Updated Title',
      };

      const updatedBoard = {
        ...mockBoard,
        ...updateBoardDto,
      };

      boardRepository.findOne!.mockResolvedValue(mockBoard);
      boardRepository.save!.mockResolvedValue(updatedBoard);

      const result = await boardsService.update(
        'board-123',
        updateBoardDto,
        userId,
      );

      expect(result).toEqual(updatedBoard);
      expect(boardRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'board-123' },
      });
      expect(boardRepository.save).toHaveBeenCalledWith({
        ...mockBoard,
        ...updateBoardDto,
      });
    });

    it('should throw NotFoundException if board not found', async () => {
      boardRepository.findOne!.mockResolvedValue(null);

      await expect(
        boardsService.update('non-existent', { title: 'Updated' }, userId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if board does not belong to user', async () => {
      const otherUserBoard = { ...mockBoard, ownerId: 'other-user' };
      boardRepository.findOne!.mockResolvedValue(otherUserBoard);

      await expect(
        boardsService.update('board-123', { title: 'Updated' }, userId),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should remove an existing board', async () => {
      boardRepository.findOne!.mockResolvedValue(mockBoard);

      await boardsService.remove('board-123', userId);

      expect(boardRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'board-123' },
      });
      expect(boardRepository.remove).toHaveBeenCalledWith(mockBoard);
    });

    it('should throw NotFoundException if board not found', async () => {
      boardRepository.findOne!.mockResolvedValue(null);

      await expect(
        boardsService.remove('non-existent', userId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if board does not belong to user', async () => {
      const otherUserBoard = { ...mockBoard, ownerId: 'other-user' };
      boardRepository.findOne!.mockResolvedValue(otherUserBoard);

      await expect(boardsService.remove('board-123', userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
