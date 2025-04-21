import { Test, TestingModule } from '@nestjs/testing';
import { BoardsController } from './boards.controller';
import { BoardsService } from './boards.service';
import { CreateBoardDto, UpdateBoardDto } from './board.schemas';

describe('BoardsController', () => {
  let boardsController: BoardsController;
  let boardsService: BoardsService;

  const mockUser = {
    id: 'user-123',
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashed-password',
  };

  const mockBoard = {
    id: 'board-123',
    title: 'Test Board',
    description: 'Test Description',
    ownerId: mockUser.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockBoardsService = {
    findAllByUser: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BoardsController],
      providers: [
        {
          provide: BoardsService,
          useValue: mockBoardsService,
        },
      ],
    }).compile();

    boardsController = module.get<BoardsController>(BoardsController);
    boardsService = module.get<BoardsService>(BoardsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of boards', async () => {
      const mockBoards = [mockBoard];
      mockBoardsService.findAllByUser.mockResolvedValue(mockBoards);

      const result = await boardsController.findAll(mockUser);

      expect(result).toEqual(mockBoards);
      expect(mockBoardsService.findAllByUser).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('findOne', () => {
    it('should return a specific board', async () => {
      mockBoardsService.findOne.mockResolvedValue(mockBoard);

      const result = await boardsController.findOne('board-123', mockUser);

      expect(result).toEqual(mockBoard);
      expect(mockBoardsService.findOne).toHaveBeenCalledWith(
        'board-123',
        mockUser.id,
      );
    });
  });

  describe('create', () => {
    it('should create a new board', async () => {
      const createBoardDto: CreateBoardDto = {
        title: 'New Board',
        description: 'New Description',
      };

      mockBoardsService.create.mockResolvedValue({
        ...createBoardDto,
        id: 'new-board-id',
        ownerId: mockUser.id,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });

      const result = await boardsController.create(createBoardDto, mockUser);

      expect(result).toEqual(expect.objectContaining(createBoardDto));
      expect(mockBoardsService.create).toHaveBeenCalledWith(
        createBoardDto,
        mockUser.id,
      );
    });
  });

  describe('update', () => {
    it('should update a board', async () => {
      const updateBoardDto: UpdateBoardDto = {
        title: 'Updated Title',
      };

      const updatedBoard = {
        ...mockBoard,
        ...updateBoardDto,
      };

      mockBoardsService.update.mockResolvedValue(updatedBoard);

      const result = await boardsController.update(
        'board-123',
        updateBoardDto,
        mockUser,
      );

      expect(result).toEqual(updatedBoard);
      expect(mockBoardsService.update).toHaveBeenCalledWith(
        'board-123',
        updateBoardDto,
        mockUser.id,
      );
    });
  });

  describe('remove', () => {
    it('should remove a board', async () => {
      await boardsController.remove('board-123', mockUser);

      expect(mockBoardsService.remove).toHaveBeenCalledWith(
        'board-123',
        mockUser.id,
      );
    });
  });
});
