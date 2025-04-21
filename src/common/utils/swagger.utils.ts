import { ApiProperty } from '@nestjs/swagger';
import { ZodSchema } from 'zod';

/**
 * Utilitário para criar decoradores ApiProperty a partir de um schema Zod
 * @param target Classe alvo para aplicar os decoradores
 * @param zodSchema Schema Zod a ser convertido para ApiProperty
 */
export function createApiPropertyDecorators(
  target: any,
  zodSchema: ZodSchema,
): void {
  const shape = (zodSchema as any)._def?.shape;

  if (!shape) {
    console.warn('Schema Zod não possui uma estrutura válida para o Swagger');
    return;
  }

  Object.entries(shape).forEach(([key, value]) => {
    const isOptional = (value as any)._def?.typeName === 'ZodOptional';
    const actualSchema = isOptional ? (value as any)._def.innerType : value;
    const typeName = (actualSchema as any)._def.typeName;

    let apiPropertyOptions: any = {
      required: !isOptional,
    };

    // Define o tipo para o Swagger com base no tipo Zod
    switch (typeName) {
      case 'ZodString':
        apiPropertyOptions.type = String;
        break;
      case 'ZodNumber':
        apiPropertyOptions.type = Number;
        break;
      case 'ZodBoolean':
        apiPropertyOptions.type = Boolean;
        break;
      case 'ZodArray':
        apiPropertyOptions.type = Array;
        apiPropertyOptions.isArray = true;
        break;
      case 'ZodDate':
        apiPropertyOptions.type = Date;
        break;
      case 'ZodEnum':
        apiPropertyOptions.enum = (actualSchema as any)._def.values;
        break;
      case 'ZodObject':
        apiPropertyOptions.type = Object;
        break;
      case 'ZodUnion':
      case 'ZodIntersection':
      case 'ZodTuple':
        apiPropertyOptions.type = Object;
        break;
      default:
        apiPropertyOptions.type = String;
    }

    // Adiciona validações adicionais se existirem
    const checks = (actualSchema as any)._def.checks;
    if (checks && Array.isArray(checks)) {
      checks.forEach((check) => {
        switch (check.kind) {
          case 'min':
            if (typeName === 'ZodString') {
              apiPropertyOptions.minLength = check.value;
            } else {
              apiPropertyOptions.minimum = check.value;
            }
            break;
          case 'max':
            if (typeName === 'ZodString') {
              apiPropertyOptions.maxLength = check.value;
            } else {
              apiPropertyOptions.maximum = check.value;
            }
            break;
          case 'email':
            apiPropertyOptions.example = 'user@example.com';
            break;
          case 'uuid':
            apiPropertyOptions.example = '12345678-1234-1234-1234-123456789012';
            break;
        }
      });
    }

    // Aplica o decorador ApiProperty à propriedade
    ApiProperty(apiPropertyOptions)(target.prototype, key);
  });
}

/**
 * Decorador de classe para gerar automaticamente decoradores ApiProperty
 * a partir de um schema Zod
 */
export function ApiZodSchema(zodSchema: ZodSchema) {
  return (target: any) => {
    createApiPropertyDecorators(target, zodSchema);
    return target;
  };
}
