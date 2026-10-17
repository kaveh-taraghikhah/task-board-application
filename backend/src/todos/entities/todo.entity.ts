import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { TodoStatus } from '../todo-status.enum';
import { TodoPriority } from '../todo-priority.enum';
import { TipTapDocument } from '../tiptap-document';

@Entity({ name: 'todos' })
export class Todo {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ type: 'enum', enum: TodoStatus, default: TodoStatus.Todo })
  status!: TodoStatus;

  @Column({ type: 'enum', enum: TodoPriority, default: TodoPriority.Medium })
  priority!: TodoPriority;

  @ManyToOne(() => User, (user) => user.assignedTodos, { nullable: true })
  @JoinColumn({ name: 'assigneeId' })
  assignee!: User | null;

  @ManyToOne(() => User, (user) => user.createdTodos, { nullable: false })
  @JoinColumn({ name: 'creatorId' })
  creator!: User;

  @Column({ type: 'date', nullable: true })
  dueDate!: string | null;

  @Column({ type: 'jsonb' })
  description!: TipTapDocument;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
