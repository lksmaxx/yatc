import { BadRequestException, PipeTransform, Injectable, ArgumentMetadata, UsePipes } from '@nestjs/common';
import { ZodSchema } from 'zod';

@Injectable()
export class ZodValidator implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: any, metadata: ArgumentMetadata) {
    try {
      const result = this.schema.parse(value);
      return result;
    } catch (error) {
      // Formatar mensagens de erro do Zod para um formato mais amigável
      if (error.errors) {
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        throw new BadRequestException({
          message: 'Validation failed',
          errors: formattedErrors,
        });
      }
      throw new BadRequestException('Validation failed');
    }
  }
}

/**
 * Class decorator para validação com Zod em nível de controlador ou método
 */
export const ZodValidate = (schema: ZodSchema) => UsePipes(new ZodValidator(schema));