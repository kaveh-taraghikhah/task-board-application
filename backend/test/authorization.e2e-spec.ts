import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as argon2 from 'argon2';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { User } from '../src/users/entities/user.entity';
import { UserRole } from '../src/users/user-role.enum';
import { Todo } from '../src/todos/entities/todo.entity';
import { TodoStatus } from '../src/todos/todo-status.enum';
import { TodoPriority } from '../src/todos/todo-priority.enum';
import { EMPTY_TIPTAP_DOCUMENT } from '../src/todos/tiptap-document';

describe('Authorization', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let owner: User;
  let member: User;
  let otherMember: User;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    dataSource = moduleRef.get(DataSource);
    await resetDatabase();
  });

  afterAll(async () => {
    await app.close();
  });

  async function resetDatabase() {
    await dataSource.query('DELETE FROM refresh_tokens');
    await dataSource.query('DELETE FROM todos');
    await dataSource.query('DELETE FROM users');

    const users = dataSource.getRepository(User);
    const passwordHash = await argon2.hash('Password123!');

    owner = await users.save(
      users.create({
        email: 'owner@test.local',
        fullName: 'Owner',
        role: UserRole.Owner,
        isActive: true,
        passwordHash,
      }),
    );
    member = await users.save(
      users.create({
        email: 'member@test.local',
        fullName: 'Member',
        role: UserRole.Member,
        isActive: true,
        passwordHash,
      }),
    );
    otherMember = await users.save(
      users.create({
        email: 'other@test.local',
        fullName: 'Other member',
        role: UserRole.Member,
        isActive: true,
        passwordHash,
      }),
    );
  }

  async function login(email: string) {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'Password123!' })
      .expect(200);

    return response.body as { accessToken: string; refreshToken: string };
  }

  it('member cannot view another user\'s tasks', async () => {
    const todos = dataSource.getRepository(Todo);
    const hiddenTask = await todos.save(
      todos.create({
        title: 'Owner private task',
        status: TodoStatus.Todo,
        priority: TodoPriority.High,
        description: EMPTY_TIPTAP_DOCUMENT,
        creator: otherMember,
        assignee: otherMember,
      }),
    );

    const { accessToken } = await login('member@test.local');

    const list = await request(app.getHttpServer())
      .get('/todos')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(list.body).toEqual([]);

    await request(app.getHttpServer())
      .get(`/todos/${hiddenTask.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(403);
  });

  it('member cannot modify users', async () => {
    const { accessToken } = await login('member@test.local');

    await request(app.getHttpServer())
      .post('/users')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        email: 'new@test.local',
        fullName: 'New person',
        password: 'Password123!',
        role: 'member',
      })
      .expect(403);

    await request(app.getHttpServer())
      .patch(`/users/${otherMember.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ isActive: false })
      .expect(403);
  });

  it('disabled user cannot access APIs using an old token', async () => {
    const { accessToken } = await login('member@test.local');

    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const { accessToken: ownerToken } = await login('owner@test.local');
    await request(app.getHttpServer())
      .patch(`/users/${member.id}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ isActive: false })
      .expect(200);

    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(401);

    await request(app.getHttpServer())
      .get('/todos')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(401);

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'member@test.local', password: 'Password123!' })
      .expect(401);
  });
});
