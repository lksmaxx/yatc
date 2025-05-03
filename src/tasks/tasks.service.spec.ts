import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, ObjectLiteral } from 'typeorm';
import { TasksService } from './tasks.service';
import { Task } from './task.entity';
import { CreateTaskDto, MoveTaskDto, UpdateTaskDto } from './task.schemas';

// Corrigida a definição do tipo MockRepository para satisfazer a restrição ObjectLiteral
type MockRepository<T extends ObjectLiteral = any> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

describe('TasksService', () => {
  let tasksService: TasksService;
  let taskRepository: MockRepository<Task>;

  const mockTaskRepository = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  });

  beforeEach(async () => {
    const taskRepositoryMock = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      update: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue({
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue(undefined),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: taskRepositoryMock,
        },
      ],
    }).compile();

    tasksService = module.get<TasksService>(TasksService);
    taskRepository = module.get(getRepositoryToken(Task));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of tasks', async () => {
      const mockTasks = [
        {
          id: '1',
          title: 'Task 1',
          description: 'Description 1',
          status: 'pending',
          dueDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          title: 'Task 2',
          description: 'Description 2',
          status: 'in_progress',
          dueDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      taskRepository.find!.mockResolvedValue(mockTasks);

      const result = await tasksService.findAll();

      expect(result).toEqual(mockTasks);
      expect(taskRepository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a task by id', async () => {
      const mockTask = {
        id: '1',
        title: 'Task 1',
        description: 'Description 1',
        status: 'pending',
        dueDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      taskRepository.findOne!.mockResolvedValue(mockTask);

      const result = await tasksService.findOne('1');

      expect(result).toEqual(mockTask);
      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException if task not found', async () => {
      taskRepository.findOne!.mockResolvedValue(null);

      await expect(tasksService.findOne('1')).rejects.toThrow(
        NotFoundException,
      );
      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });

  describe('create', () => {
    it('should create and return a new task', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'New Task',
        description: 'New Description',
        status: 'pending',
        list: { id: 'list1' },
      };

      const mockTask = {
        id: '1',
        ...createTaskDto,
        dueDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      taskRepository.create!.mockReturnValue(mockTask);
      taskRepository.save!.mockResolvedValue(mockTask);

      const result = await tasksService.create(createTaskDto);

      expect(result).toEqual(mockTask);
      expect(taskRepository.create).toHaveBeenCalledWith(createTaskDto);
      expect(taskRepository.save).toHaveBeenCalledWith(mockTask);
    });
  });

  describe('update', () => {
    it('should update and return the task', async () => {
      const taskId = '1';
      const updateTaskDto: UpdateTaskDto = {
        title: 'Updated Task',
        status: 'in_progress',
      };

      const existingTask = {
        id: taskId,
        title: 'Original Task',
        description: 'Original Description',
        status: 'pending',
        dueDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedTask = {
        ...existingTask,
        ...updateTaskDto,
      };

      taskRepository.findOne!.mockResolvedValue(existingTask);
      taskRepository.save!.mockResolvedValue(updatedTask);

      const result = await tasksService.update(taskId, updateTaskDto);

      expect(result).toEqual(updatedTask);
      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: { id: taskId },
      });
      expect(taskRepository.save).toHaveBeenCalledWith(updatedTask);
    });

    it('should throw NotFoundException if task not found', async () => {
      const taskId = '1';
      const updateTaskDto: UpdateTaskDto = {
        title: 'Updated Task',
      };

      taskRepository.findOne!.mockResolvedValue(null);

      await expect(tasksService.update(taskId, updateTaskDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: { id: taskId },
      });
      expect(taskRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove the task', async () => {
      const taskId = '1';
      const mockTask = {
        id: taskId,
        title: 'Task to remove',
        description: 'Description',
        position: 2,
        list: { id: 'list1' },
      };

      taskRepository.findOne!.mockResolvedValue(mockTask);
      taskRepository.remove!.mockResolvedValue(undefined);

      await tasksService.remove(taskId);

      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: { id: taskId },
      });
      expect(taskRepository.remove).toHaveBeenCalledWith(mockTask);
    });

    it('should throw NotFoundException if task not found', async () => {
      const taskId = '1';

      taskRepository.findOne!.mockResolvedValue(null);

      await expect(tasksService.remove(taskId)).rejects.toThrow(
        NotFoundException,
      );
      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: { id: taskId },
      });
      expect(taskRepository.remove).not.toHaveBeenCalled();
    });
  });

  describe('moveTask', () => {
    it('should not update positions when moving to the same position', async () => {
      const taskId = '1';
      const moveTaskDto: MoveTaskDto = {
        listId: 'list1',
        position: 1,
      };

      const mockTask = {
        id: taskId,
        position: 1,
        list: { id: 'list1' },
      };

      taskRepository.findOne!.mockResolvedValue(mockTask);
      taskRepository.createQueryBuilder!.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue(undefined),
      });
      taskRepository.update!.mockResolvedValue(undefined);

      await tasksService.moveTask(taskId, moveTaskDto);

      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: { id: taskId },
      });
      expect(taskRepository.update).not.toHaveBeenCalled();
    });

    it('should move task to a higher position', async () => {
      const taskId = '1';
      const moveTaskDto: MoveTaskDto = {
        listId: 'list1',
        position: 3,
      };

      const mockTask = {
        id: taskId,
        position: 1,
        list: { id: 'list1' },
      };

      const queryBuilderMock = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue(undefined),
      };

      taskRepository.findOne!.mockResolvedValue(mockTask);
      taskRepository.createQueryBuilder!.mockReturnValue(queryBuilderMock);
      taskRepository.update!.mockResolvedValue(undefined);

      await tasksService.moveTask(taskId, moveTaskDto);

      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: { id: taskId },
      });
      expect(queryBuilderMock.update).toHaveBeenCalled();
      expect(queryBuilderMock.set).toHaveBeenCalledWith({
        position: expect.any(Function),
      });
      expect(queryBuilderMock.where).toHaveBeenCalledWith('list_id = :listId', {
        listId: 'list1',
      });
      expect(taskRepository.update).toHaveBeenCalledWith(taskId, {
        position: 3,
      });
    });

    it('should move task to a lower position', async () => {
      const taskId = '1';
      const moveTaskDto: MoveTaskDto = {
        listId: 'list1',
        position: 1,
      };

      const mockTask = {
        id: taskId,
        position: 3,
        list: { id: 'list1' },
      };

      const queryBuilderMock = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue(undefined),
      };

      taskRepository.findOne!.mockResolvedValue(mockTask);
      taskRepository.createQueryBuilder!.mockReturnValue(queryBuilderMock);
      taskRepository.update!.mockResolvedValue(undefined);

      await tasksService.moveTask(taskId, moveTaskDto);

      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: { id: taskId },
      });
      expect(queryBuilderMock.update).toHaveBeenCalled();
      expect(queryBuilderMock.set).toHaveBeenCalledWith({
        position: expect.any(Function),
      });
      expect(queryBuilderMock.where).toHaveBeenCalledWith('list_id = :listId', {
        listId: 'list1',
      });
      expect(taskRepository.update).toHaveBeenCalledWith(taskId, {
        position: 1,
      });
    });
  });
});
