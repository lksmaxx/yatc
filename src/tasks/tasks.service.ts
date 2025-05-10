import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { CreateTaskDto, UpdateTaskDto, MoveTaskDto } from './task.schemas';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  findAll(): Promise<Task[]> {
    return this.taskRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['list'],
    });
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const task = this.taskRepository.create(createTaskDto);
    const position = await this.taskRepository.count({
      where: { list: { id: task.list.id } },
    });
    task.position = position;
    const savedTask = await this.taskRepository.save(task);
    return savedTask;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id);
    Object.assign(task, updateTaskDto);
    return this.taskRepository.save(task);
  }

  async remove(id: string): Promise<{ message: string }> {
    const task = await this.findOne(id);
    const listId = task.list?.id;
    const position = task.position;

    await this.taskRepository.remove(task);

    if (listId && position !== undefined) {
      await this.taskRepository
        .createQueryBuilder('task')
        .update()
        .set({ position: () => 'position - 1' })
        .where('list_id = :listId', { listId })
        .andWhere('position > :position', { position })
        .execute();
    }

    return { message: 'Task deleted successfully' };
  }

  async moveTask(id: string, moveTaskDto: MoveTaskDto): Promise<void> {
    const { listId, position } = moveTaskDto;

    const task = await this.findOne(id);
    const sourceListId = task.list.id;
    const oldPosition = task.position;

    // Se não há mudanças, retorna imediatamente
    if (sourceListId === listId && oldPosition === position) {
      return;
    }

    // Se mudando para outra lista
    if (sourceListId !== listId) {
      // Atualiza posições na lista de origem (reduz posições maiores que a posição atual)
      await this.taskRepository
        .createQueryBuilder('task')
        .update()
        .set({ position: () => 'position - 1' })
        .where('list_id = :sourceListId', { sourceListId })
        .andWhere('position > :oldPosition', { oldPosition })
        .execute();

      // Atualiza posições na lista de destino (aumenta posições maiores ou iguais à nova posição)
      await this.taskRepository
        .createQueryBuilder('task')
        .update()
        .set({ position: () => 'position + 1' })
        .where('list_id = :listId', { listId })
        .andWhere('position >= :position', { position })
        .execute();

      // Atualiza a tarefa com a nova lista e posição
      await this.taskRepository.update(id, {
        list: { id: listId },
        position,
      });
    }
    // Se movendo dentro da mesma lista
    else {
      if (oldPosition < position) {
        await this.taskRepository
          .createQueryBuilder('task')
          .update()
          .set({
            position: () => 'position - 1',
          })
          .where('list_id = :listId', { listId })
          .andWhere('position <= :position', { position })
          .andWhere('position > :oldPosition', { oldPosition })
          .execute();
      } else {
        await this.taskRepository
          .createQueryBuilder('task')
          .update()
          .set({ position: () => `position + 1` })
          .where('list_id = :listId', { listId })
          .andWhere('position >= :position', { position })
          .andWhere('position < :oldPosition', { oldPosition })
          .execute();
      }

      await this.taskRepository.update(id, { position });
    }
  }
}
