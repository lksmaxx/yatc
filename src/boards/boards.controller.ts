import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { BoardsService } from './boards.service';
import {
  CreateBoardDto,
  UpdateBoardDto,
  CreateBoardSchema,
  UpdateBoardSchema,
  BoardSearchDto,
} from './board.schemas';
import { ZodValidator } from '../common/decorators/zod-validator.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { ListsService } from '../lists/lists.service';

@Controller('boards')
@UseGuards(JwtAuthGuard)
export class BoardsController {
  constructor(
    private readonly boardsService: BoardsService,
    private readonly listsService: ListsService,
  ) {}

  @Get()
  findAll(@CurrentUser() user: User, @Query() searchQuery: BoardSearchDto) {
    return this.boardsService.findAll(searchQuery);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.boardsService.findOne(id, user.id);
  }

  @Get(':id/lists')
  findAllLists(@Param('id') id: string, @CurrentUser() user: User) {
    return this.listsService.findAllByBoard(id, user.id);
  }

  @Post()
  create(
    @Body(new ZodValidator(CreateBoardSchema)) createBoardDto: CreateBoardDto,
    @CurrentUser() user: User,
  ) {
    return this.boardsService.create(createBoardDto, user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidator(UpdateBoardSchema)) updateBoardDto: UpdateBoardDto,
    @CurrentUser() user: User,
  ) {
    return this.boardsService.update(id, updateBoardDto, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.boardsService.remove(id, user.id);
  }
}
