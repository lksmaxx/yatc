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
import { ListsService } from './lists.service';
import {
  CreateListDto,
  UpdateListDto,
  MoveListDto,
  CreateListSchema,
  UpdateListSchema,
  MoveListSchema,
  ListSearchDto,
} from './list.schemas';
import { ZodValidator } from '../common/decorators/zod-validator.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/user.entity';

@Controller('lists')
@UseGuards(JwtAuthGuard)
export class ListsController {
  constructor(private readonly listsService: ListsService) {}

  @Get()
  findAll(@Query() searchQuery: ListSearchDto, @CurrentUser() user: User) {
    return this.listsService.findAll(searchQuery);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.listsService.findOne(id, user.id);
  }

  @Post()
  create(
    @Body(new ZodValidator(CreateListSchema)) createListDto: CreateListDto,
    @CurrentUser() user: User,
  ) {
    return this.listsService.create(createListDto, user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidator(UpdateListSchema)) updateListDto: UpdateListDto,
    @CurrentUser() user: User,
  ) {
    return this.listsService.update(id, updateListDto, user.id);
  }

  @Patch(':id/move')
  move(
    @Param('id') id: string,
    @Body(new ZodValidator(MoveListSchema)) moveListDto: MoveListDto,
    @CurrentUser() user: User,
  ) {
    return this.listsService.move(id, moveListDto, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.listsService.remove(id, user.id);
  }
}
