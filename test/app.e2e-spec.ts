import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { TransformResponseInterceptor } from '../src/common/interceptors/transform-response.interceptor';
import { TestModule } from './test.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../src/users/user.entity';
import { Task } from '../src/tasks/task.entity';

describe('API E2E Tests', () => {
  let app: INestApplication;
  let authToken: string;
  let userId: string;
  let taskId: string;
  let userRepository: Repository<User>;
  let taskRepository: Repository<Task>;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Obter os repositórios para limpeza e preparação de dados
    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );
    taskRepository = moduleFixture.get<Repository<Task>>(
      getRepositoryToken(Task),
    );

    // Configurar a aplicação com os mesmos filtros e interceptors usados em produção
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new TransformResponseInterceptor());

    await app.init();

    // Limpar dados existentes antes de iniciar os testes
    await taskRepository.clear();
    await userRepository.clear();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('AppController', () => {
    it('/ (GET)', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect(/Hello World/);
    });
  });

  describe('Auth API', () => {
    const testUser = {
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
      password: 'TestPassword123',
    };

    it('should register a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('email', testUser.email);
      expect(response.body.user).toHaveProperty('name', testUser.name);
      expect(response.body.user).not.toHaveProperty('password');

      // Salvar o token para usar em testes posteriores
      authToken = response.body.accessToken;
      userId = response.body.user.id;
    });

    it('should not register a user with an existing email', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(409);
    });

    it('should login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user).toHaveProperty('email', testUser.email);
        });
    });

    it('should not login with invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        })
        .expect(401);
    });
  });

  describe('Tasks API', () => {
    const testTask = {
      title: 'Test Task',
      description: 'This is a test task',
      status: 'pending',
    };

    it('should create a new task with authentication', async () => {
      const response = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testTask)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('title', testTask.title);
      expect(response.body).toHaveProperty('description', testTask.description);
      expect(response.body).toHaveProperty('status', testTask.status);

      // Salvar o ID da tarefa para testes futuros
      taskId = response.body.id;
    });

    it('should get all tasks', () => {
      return request(app.getHttpServer())
        .get('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });

    it('should get a specific task by ID', () => {
      return request(app.getHttpServer())
        .get(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', taskId);
          expect(res.body).toHaveProperty('title', testTask.title);
        });
    });

    it('should update a task', () => {
      const updatedTask = {
        title: 'Updated Task Title',
        status: 'in_progress',
      };

      return request(app.getHttpServer())
        .patch(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedTask)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', taskId);
          expect(res.body).toHaveProperty('title', updatedTask.title);
          expect(res.body).toHaveProperty('status', updatedTask.status);
          expect(res.body).toHaveProperty('description', testTask.description);
        });
    });

    it('should delete a task', () => {
      return request(app.getHttpServer())
        .delete(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('should not find the deleted task', () => {
      return request(app.getHttpServer())
        .get(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should validate task input', () => {
      const invalidTask = {
        // título ausente
        description: 'This task is missing a title',
      };

      return request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidTask)
        .expect(400);
    });
  });

  describe('Users API', () => {
    it('should get current user profile', () => {
      return request(app.getHttpServer())
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', userId);
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('should update user profile', () => {
      const updatedInfo = {
        name: 'Updated User Name',
      };

      return request(app.getHttpServer())
        .patch(`/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedInfo)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('name', updatedInfo.name);
        });
    });
  });
});
