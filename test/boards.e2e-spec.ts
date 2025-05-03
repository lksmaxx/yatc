import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { TestModule } from './test.module';
import { Board } from '../src/boards/board.entity';
import { User } from '../src/users/user.entity';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { TransformResponseInterceptor } from '../src/common/interceptors/transform-response.interceptor';

describe('Boards (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let boardRepository: Repository<Board>;
  let userRepository: Repository<User>;

  let testUser: User;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new TransformResponseInterceptor());

    jwtService = moduleFixture.get<JwtService>(JwtService);
    boardRepository = moduleFixture.get<Repository<Board>>(
      getRepositoryToken(Board),
    );
    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );

    const dataSource = moduleFixture.get<DataSource>(DataSource);

    await app.init();

    await dataSource.runMigrations();

    // Criar usuário de teste
    testUser = userRepository.create({
      name: 'Test User',
      email: 'boards-test@example.com',
      password: 'hashed-password', // normalmente seria um hash real
    });

    await userRepository.save(testUser);

    // Gerar token JWT
    const payload = { email: testUser.email, sub: testUser.id };
    authToken = jwtService.sign(payload);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /boards', () => {
    beforeEach(async () => {
      // Limpar boards antes de cada teste
      await boardRepository.delete({});

      // Criar alguns boards de teste
      await boardRepository.save([
        {
          title: 'Test Board 1',
          description: 'Description 1',
          owner: testUser,
        },
        {
          title: 'Test Board 2',
          description: 'Description 2',
          owner: testUser,
        },
      ]);
    });

    it('should return all boards for authenticated user', () => {
      return request(app.getHttpServer())
        .get('/boards')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBe(2);
          expect(res.body[0].title).toBeDefined();
          expect(res.body[0].owner.id).toBe(testUser.id);
        });
    });

    it('should return 401 if user is not authenticated', () => {
      return request(app.getHttpServer()).get('/boards').expect(401);
    });
  });

  describe('POST /boards', () => {
    it('should create a new board', () => {
      const createBoardDto = {
        title: 'New e2e Board',
        description: 'Board created in e2e test',
      };

      return request(app.getHttpServer())
        .post('/boards')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createBoardDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.title).toBe(createBoardDto.title);
          expect(res.body.description).toBe(createBoardDto.description);
          expect(res.body.owner.id).toBe(testUser.id);
          expect(res.body.id).toBeDefined();
        });
    });

    it('should return 400 if title is missing', () => {
      return request(app.getHttpServer())
        .post('/boards')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ description: 'Missing title' })
        .expect(400);
    });
  });

  describe('GET /boards/:id', () => {
    let testBoard: Board;

    beforeEach(async () => {
      // Criar um board para os testes
      testBoard = await boardRepository.save({
        title: 'Get Board Test',
        description: 'Test retrieving a specific board',
        owner: testUser,
      });
    });

    it('should return a specific board', () => {
      return request(app.getHttpServer())
        .get(`/boards/${testBoard.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(testBoard.id);
          expect(res.body.title).toBe(testBoard.title);
          expect(res.body.owner.id).toBe(testUser.id);
        });
    });

    it('should return 404 for non-existent board', () => {
      return request(app.getHttpServer())
        .get('/boards/99999999-9999-9999-9999-999999999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PATCH /boards/:id', () => {
    let testBoard: Board;

    beforeEach(async () => {
      // Criar um board para os testes
      testBoard = await boardRepository.save({
        title: 'Update Board Test',
        description: 'Test updating a board',
        owner: testUser,
      });
    });

    it('should update a board', () => {
      const updateBoardDto = {
        title: 'Updated Board Title',
        description: 'Updated description',
      };

      return request(app.getHttpServer())
        .patch(`/boards/${testBoard.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateBoardDto)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(testBoard.id);
          expect(res.body.title).toBe(updateBoardDto.title);
          expect(res.body.description).toBe(updateBoardDto.description);
          expect(res.body.owner.id).toBe(testUser.id);
        });
    });

    it('should return 404 for non-existent board', () => {
      return request(app.getHttpServer())
        .patch('/boards/99999999-9999-9999-9999-999999999999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated Title' })
        .expect(404);
    });
  });

  describe('DELETE /boards/:id', () => {
    let testBoard: Board;

    beforeEach(async () => {
      // Criar um board para os testes
      testBoard = await boardRepository.save({
        title: 'Delete Board Test',
        description: 'Test deleting a board',
        owner: testUser,
      });
    });

    it('should delete a board', () => {
      return request(app.getHttpServer())
        .delete(`/boards/${testBoard.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('should return 404 for non-existent board', () => {
      return request(app.getHttpServer())
        .delete('/boards/99999999-9999-9999-9999-999999999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
