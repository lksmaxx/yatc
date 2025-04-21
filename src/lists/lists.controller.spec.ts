import { Test, TestingModule } from '@nestjs/testing';
import { ListsController } from './lists.controller';
import { ListsService } from './lists.service';
import { CreateListDto, UpdateListDto, MoveListDto } from './list.schemas';

describe('ListsController', () => {
  let listsController: ListsController;
  let listsService: ListsService;

  const mockUser = {
    id: 'user-123',
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashed-password',
  };

  const mockList = {
    id: 'list-123',
    title: 'Test List',
    position: 0,
    board: {
      id: 'board-123',
      title: 'Test Board',
      ownerId: mockUser.id,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockListsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    move: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ListsController],
      providers: [
        {
          provide: ListsService,
          useValue: mockListsService,
        },
      ],
    }).compile();

    listsController = module.get<ListsController>(ListsController);
    listsService = module.get<ListsService>(ListsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all lists for a board', async () => {
      const mockLists = [mockList];
      const boardId = 'board-123';
      mockListsService.findAll.mockResolvedValue(mockLists);

      const result = await listsController.findAll(boardId, mockUser);

      expect(result).toEqual(mockLists);
      expect(mockListsService.findAll).toHaveBeenCalledWith(
        boardId,
        mockUser.id,
      );
    });
  });

  describe('findOne', () => {
    it('should return a specific list', async () => {
      mockListsService.findOne.mockResolvedValue(mockList);

      const result = await listsController.findOne('list-123', mockUser);

      expect(result).toEqual(mockList);
      expect(mockListsService.findOne).toHaveBeenCalledWith(
        'list-123',
        mockUser.id,
      );
    });
  });

  describe('create', () => {
    it('should create a new list', async () => {
      const createListDto: CreateListDto = {
        title: 'New List',
        boardId: 'board-123',
      };

      const newList = {
        id: 'new-list-id',
        ...createListDto,
        position: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockListsService.create.mockResolvedValue(newList);

      const result = await listsController.create(createListDto, mockUser);

      expect(result).toEqual(newList);
      expect(mockListsService.create).toHaveBeenCalledWith(
        createListDto,
        mockUser.id,
      );
    });
  });

  describe('update', () => {
    it('should update a list', async () => {
      const updateListDto: UpdateListDto = {
        title: 'Updated Title',
      };

      const updatedList = {
        ...mockList,
        ...updateListDto,
      };

      mockListsService.update.mockResolvedValue(updatedList);

      const result = await listsController.update(
        'list-123',
        updateListDto,
        mockUser,
      );

      expect(result).toEqual(updatedList);
      expect(mockListsService.update).toHaveBeenCalledWith(
        'list-123',
        updateListDto,
        mockUser.id,
      );
    });
  });

  describe('move', () => {
    it('should move a list', async () => {
      const moveListDto: MoveListDto = {
        position: 2,
      };

      const movedList = {
        ...mockList,
        position: moveListDto.position,
      };

      mockListsService.move.mockResolvedValue(movedList);

      const result = await listsController.move(
        'list-123',
        moveListDto,
        mockUser,
      );

      expect(result).toEqual(movedList);
      expect(mockListsService.move).toHaveBeenCalledWith(
        'list-123',
        moveListDto,
        mockUser.id,
      );
    });
  });

  describe('remove', () => {
    it('should remove a list', async () => {
      await listsController.remove('list-123', mockUser);

      expect(mockListsService.remove).toHaveBeenCalledWith(
        'list-123',
        mockUser.id,
      );
    });
  });
});
