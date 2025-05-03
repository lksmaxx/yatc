import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { List } from 'src/lists/list.entity';
import { TestModule } from './test.module';
import { TransformResponseInterceptor } from 'src/common/interceptors/transform-response.interceptor';
import { Task } from 'src/tasks/task.entity';
import { HttpExceptionFilter } from 'src/common/filters/http-exception.filter';
import { User } from 'src/users/user.entity';

describe('Tasks (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let taskRepository: Repository<Task>;
  let listRepository: Repository<List>;

  let testUserId: string;
  let authToken: string;
  let listId: string;
  let boardId: string;
  let taskId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new TransformResponseInterceptor());

    jwtService = moduleFixture.get<JwtService>(JwtService);
    taskRepository = moduleFixture.get<Repository<Task>>(
      getRepositoryToken(Task),
    );
    listRepository = moduleFixture.get<Repository<List>>(
      getRepositoryToken(List),
    );

    await app.init();

    const dataSource = moduleFixture.get<DataSource>(DataSource);
    await dataSource.runMigrations();

    //sign up
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@test.com',
        password: 'test',
        name: 'Test User',
      });

    authToken = response.body.accessToken;
    testUserId = response.body.user.id;

    //create board
    const boardResponse = await request(app.getHttpServer())
      .post('/boards')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'Test Board' });

    boardId = boardResponse.body.id;

    //create list
    const listResponse = await request(app.getHttpServer())
      .post('/lists')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'Test List', board: { id: boardId } });

    listId = listResponse.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@test.com',
        password: 'test',
      });

    authToken = response.body.accessToken;
    testUserId = response.body.user.id;
  });

  describe('Create Task', () => {
    it('should create a task', async () => {
      expect(listId).toBeDefined();

      const response = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Task',
          description: 'Test Description',
          status: 'pending',
          list: { id: listId },
        });

      expect(response.status).toBe(201);
      taskId = response.body.id;
      expect(response.body).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          title: 'Test Task',
          description: 'Test Description',
          status: 'pending',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          list: { id: listId },
        }),
      );
    });
  });

  describe('Get Tasks', () => {
    it('should get all tasks', async () => {
      const response = await request(app.getHttpServer())
        .get('/tasks')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          title: expect.any(String),
          description: expect.any(String),
          status: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          position: expect.any(Number),
        }),
      );
    });
  });

  describe('Get Task by ID', () => {
    it('should get a task by ID', async () => {
      expect(taskId).toBeDefined();

      const response = await request(app.getHttpServer())
        .get(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: taskId,
          title: expect.any(String),
          description: expect.any(String),
          status: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          position: expect.any(Number),
        }),
      );
    });
  });

  describe('Update Task', () => {
    it('should update a task', async () => {
      expect(taskId).toBeDefined();

      const response = await request(app.getHttpServer())
        .patch(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Task',
          description: 'Updated Description',
          status: 'in_progress',
          dueDate: '2024-01-01T00:00:00.000Z',
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: taskId,
          title: 'Updated Task',
          description: 'Updated Description',
          status: 'in_progress',
          dueDate: '2024-01-01T00:00:00.000Z',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        }),
      );
    });
  });

  describe('Delete Task', () => {
    it('should delete a task', async () => {
      expect(taskId).toBeDefined();

      const response = await request(app.getHttpServer())
        .delete(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          message: 'Task deleted successfully',
        }),
      );
    });
  });
});
