import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from './users/entities/user.entity';
import { Todo } from './todos/entities/todo.entity';
import { RefreshToken } from './auth/entities/refresh-token.entity';
import { InitialSchema1730000000000 } from './database/migrations/1730000000000-InitialSchema';

config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST ?? 'localhost',
  port: Number(process.env.POSTGRES_PORT ?? 5432),
  username: process.env.POSTGRES_USER ?? 'taskboard',
  password: process.env.POSTGRES_PASSWORD ?? 'taskboard',
  database: process.env.POSTGRES_DB ?? 'taskboard',
  entities: [User, Todo, RefreshToken],
  migrations: [InitialSchema1730000000000],
  synchronize: false,
  logging: false,
});
