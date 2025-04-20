import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListsController } from './lists.controller';
import { ListsService } from './lists.service';
import { List } from './list.entity';
import { Board } from '../boards/board.entity';

@Module({
  imports: [TypeOrmModule.forFeature([List, Board])],
  controllers: [ListsController],
  providers: [ListsService],
  exports: [ListsService],
})
export class ListsModule {}
