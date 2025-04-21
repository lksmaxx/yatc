import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestModule } from './test.module';
import { Board } from '../src/boards/board.entity';
import { List } from '../src/lists/list.entity';
import { User } from '../src/users/user.entity';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { TransformResponseInterceptor } from '../src/common/interceptors/transform-response.interceptor';

describe('Lists (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let boardRepository: Repository<Board>;
  let listRepository: Repository<List>;
  let userRepository: Repository<User>;

  let testUser: User;
  let testBoard: Board;
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
    listRepository = moduleFixture.get<Repository<List>>(
      getRepositoryToken(List),
    );
    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );

    await app.init();

    // Criar usuário de teste
    testUser = userRepository.create({
      name: 'Test User',
      email: 'lists-test@example.com',
      password: 'hashed-password', // normalmente seria um hash real
    });

    await userRepository.save(testUser);

    // Criar um board de teste
    testBoard = boardRepository.create({
      title: 'Test Board for Lists',
      description: 'Board for testing lists',
      ownerId: testUser.id,
    });

    await boardRepository.save(testBoard);

    // Gerar token JWT
    const payload = { email: testUser.email, sub: testUser.id };
    authToken = jwtService.sign(payload);
  });

  afterAll(async () => {
    // Limpar dados de teste
    await listRepository.delete({});
    await boardRepository.delete({});
    await userRepository.delete({ id: testUser.id });
    await app.close();
  });

  describe('GET /lists', () => {
    beforeEach(async () => {
      // Limpar listas antes de cada teste
      await listRepository.delete({});

      // Criar algumas listas de teste
      await listRepository.save([
        {
          title: 'Test List 1',
          position: 0,
          board: testBoard,
        },
        {
          title: 'Test List 2',
          position: 1,
          board: testBoard,
        },
      ]);
    });

    it('should return all lists for a board', () => {
      return request(app.getHttpServer())
        .get('/lists')
        .query({ boardId: testBoard.id })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBe(2);
          expect(res.body[0].title).toBeDefined();
          expect(res.body[0].position).toBeDefined();
          expect(res.body[1].position).toBeGreaterThan(res.body[0].position);
        });
    });

    it('should return 401 if user is not authenticated', () => {
      return request(app.getHttpServer())
        .get('/lists')
        .query({ boardId: testBoard.id })
        .expect(401);
    });

    it('should return 404 if board does not exist', () => {
      return request(app.getHttpServer())
        .get('/lists')
        .query({ boardId: '99999999-9999-9999-9999-999999999999' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('POST /lists', () => {
    it('should create a new list', () => {
      const createListDto = {
        title: 'New e2e List',
        boardId: testBoard.id,
      };

      return request(app.getHttpServer())
        .post('/lists')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createListDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.title).toBe(createListDto.title);
          expect(res.body.id).toBeDefined();
          expect(res.body.position).toBeDefined();
        });
    });

    it('should return 400 if title is missing', () => {
      return request(app.getHttpServer())
        .post('/lists')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ boardId: testBoard.id })
        .expect(400);
    });

    it('should return 400 if boardId is missing', () => {
      return request(app.getHttpServer())
        .post('/lists')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Missing board ID' })
        .expect(400);
    });
  });

  describe('GET /lists/:id', () => {
    let testList: List;

    beforeEach(async () => {
      // Criar uma lista para os testes
      testList = await listRepository.save({
        title: 'Get List Test',
        position: 0,
        board: testBoard,
      });
    });

    it('should return a specific list', () => {
      return request(app.getHttpServer())
        .get(`/lists/${testList.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(testList.id);
          expect(res.body.title).toBe(testList.title);
        });
    });

    it('should return 404 for non-existent list', () => {
      return request(app.getHttpServer())
        .get('/lists/99999999-9999-9999-9999-999999999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PATCH /lists/:id', () => {
    let testList: List;

    beforeEach(async () => {
      // Criar uma lista para os testes
      testList = await listRepository.save({
        title: 'Update List Test',
        position: 0,
        board: testBoard,
      });
    });

    it('should update a list title', () => {
      const updateListDto = {
        title: 'Updated List Title',
      };

      return request(app.getHttpServer())
        .patch(`/lists/${testList.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateListDto)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(testList.id);
          expect(res.body.title).toBe(updateListDto.title);
        });
    });

    it('should return 404 for non-existent list', () => {
      return request(app.getHttpServer())
        .patch('/lists/99999999-9999-9999-9999-999999999999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated Title' })
        .expect(404);
    });
  });

  describe('PATCH /lists/:id/move', () => {
    let testList: List;

    beforeEach(async () => {
      // Criar uma lista para os testes
      testList = await listRepository.save({
        title: 'Move List Test',
        position: 0,
        board: testBoard,
      });
    });

    it('should move a list', () => {
      const moveListDto = {
        position: 3,
      };

      return request(app.getHttpServer())
        .patch(`/lists/${testList.id}/move`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(moveListDto)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(testList.id);
          expect(res.body.position).toBe(moveListDto.position);
        });
    });

    it('should return 400 if position is missing', () => {
      return request(app.getHttpServer())
        .patch(`/lists/${testList.id}/move`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);
    });
  });

  describe('DELETE /lists/:id', () => {
    let testList: List;

    beforeEach(async () => {
      // Criar uma lista para os testes
      testList = await listRepository.save({
        title: 'Delete List Test',
        position: 0,
        board: testBoard,
      });
    });

    it('should delete a list', () => {
      return request(app.getHttpServer())
        .delete(`/lists/${testList.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .then(async () => {
          // Verificar se a lista foi realmente removida
          const deletedList = await listRepository.findOne({
            where: { id: testList.id },
          });
          expect(deletedList).toBeNull();
        });
    });

    it('should return 404 for non-existent list', () => {
      return request(app.getHttpServer())
        .delete('/lists/99999999-9999-9999-9999-999999999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
