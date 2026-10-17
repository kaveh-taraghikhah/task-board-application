import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo } from './entities/todo.entity';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/user-role.enum';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { validateTipTapDocument } from './tiptap.validator';
import { EMPTY_TIPTAP_DOCUMENT } from './tiptap-document';
import { UsersService } from '../users/users.service';
import { TodoStatus } from './todo-status.enum';
import { TodoPriority } from './todo-priority.enum';

@Injectable()
export class TodosService {
  constructor(
    @InjectRepository(Todo)
    private readonly todos: Repository<Todo>,
    private readonly usersService: UsersService,
  ) {}

  async list(actor: User, status?: TodoStatus, assigneeId?: string) {
    const query = this.todos
      .createQueryBuilder('todo')
      .leftJoinAndSelect('todo.assignee', 'assignee')
      .leftJoinAndSelect('todo.creator', 'creator')
      .orderBy('todo.createdAt', 'DESC');

    if (actor.role === UserRole.Member) {
      query.andWhere('(creator.id = :userId OR assignee.id = :userId)', { userId: actor.id });
    }

    if (status) {
      query.andWhere('todo.status = :status', { status });
    }

    if (assigneeId) {
      query.andWhere('assignee.id = :assigneeId', { assigneeId });
    }

    const rows = await query.getMany();
    return rows.map((todo) => this.toPublic(todo));
  }

  async findOne(actor: User, id: string) {
    const todo = await this.todos.findOne({
      where: { id },
      relations: { assignee: true, creator: true },
    });
    if (!todo) {
      throw new NotFoundException('Task not found.');
    }
    this.assertCanView(actor, todo);
    return this.toPublic(todo);
  }

  async create(actor: User, dto: CreateTodoDto) {
    const description = validateTipTapDocument(dto.description ?? EMPTY_TIPTAP_DOCUMENT);
    const assignee = await this.resolveAssignee(actor, dto.assigneeId, true);

    const todo = this.todos.create({
      title: dto.title,
      status: dto.status ?? TodoStatus.Todo,
      priority: dto.priority ?? TodoPriority.Medium,
      dueDate: dto.dueDate ?? null,
      description,
      creator: actor,
      assignee,
    });

    return this.toPublic(await this.todos.save(todo));
  }

  async update(actor: User, id: string, dto: UpdateTodoDto) {
    const todo = await this.todos.findOne({
      where: { id },
      relations: { assignee: true, creator: true },
    });
    if (!todo) {
      throw new NotFoundException('Task not found.');
    }

    this.assertCanView(actor, todo);

    if (actor.role === UserRole.Member && dto.assigneeId && dto.assigneeId !== actor.id) {
      throw new ForbiddenException('Members cannot assign tasks to others.');
    }

    if (dto.title !== undefined) todo.title = dto.title;
    if (dto.status !== undefined) todo.status = dto.status;
    if (dto.priority !== undefined) todo.priority = dto.priority;
    if (dto.dueDate !== undefined) todo.dueDate = dto.dueDate;
    if (dto.description !== undefined) {
      todo.description = validateTipTapDocument(dto.description);
    }
    if (dto.assigneeId !== undefined) {
      todo.assignee = await this.resolveAssignee(actor, dto.assigneeId, false);
    }

    return this.toPublic(await this.todos.save(todo));
  }

  async remove(actor: User, id: string): Promise<void> {
    const todo = await this.todos.findOne({
      where: { id },
      relations: { creator: true, assignee: true },
    });
    if (!todo) {
      throw new NotFoundException('Task not found.');
    }

    if (actor.role === UserRole.Member && todo.creator.id !== actor.id) {
      throw new ForbiddenException("Members cannot delete other users' tasks.");
    }

    if (actor.role === UserRole.Member) {
      this.assertCanView(actor, todo);
    }

    await this.todos.remove(todo);
  }

  private async resolveAssignee(
    actor: User,
    assigneeId: string | null | undefined,
    isCreate: boolean,
  ) {
    if (!assigneeId) {
      if (isCreate && actor.role === UserRole.Member) {
        return actor;
      }
      return null;
    }

    if (actor.role === UserRole.Member && assigneeId !== actor.id) {
      throw new ForbiddenException('Members cannot assign tasks to others.');
    }

    const assignee = await this.usersService.findById(assigneeId);
    if (!assignee || !assignee.isActive) {
      throw new NotFoundException('Assignee not found.');
    }
    return assignee;
  }

  private assertCanView(actor: User, todo: Todo): void {
    if (actor.role !== UserRole.Member) {
      return;
    }

    const createdBySelf = todo.creator.id === actor.id;
    const assignedToSelf = todo.assignee?.id === actor.id;
    if (!createdBySelf && !assignedToSelf) {
      throw new ForbiddenException('You do not have access to this task.');
    }
  }

  private toPublic(todo: Todo) {
    return {
      id: todo.id,
      title: todo.title,
      status: todo.status,
      priority: todo.priority,
      dueDate: todo.dueDate,
      description: todo.description,
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt,
      creator: {
        id: todo.creator.id,
        fullName: todo.creator.fullName,
        email: todo.creator.email,
      },
      assignee: todo.assignee
        ? {
            id: todo.assignee.id,
            fullName: todo.assignee.fullName,
            email: todo.assignee.email,
          }
        : null,
    };
  }
}
