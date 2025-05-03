import { List } from '../lists/list.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 20, default: 'pending' })
  status: string;

  @Column({ type: 'timestamp', nullable: true, name: 'due_date' })
  dueDate: Date;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;

  @ManyToOne(() => List, (list) => list.tasks, {
    cascade: true,
  })
  @JoinColumn({ name: 'list_id' })
  list: List;

  @Column({ type: 'int', default: 0 })
  position: number;
}
