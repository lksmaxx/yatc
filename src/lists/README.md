# Módulo de Listas (Lists Module)

Este módulo gerencia as listas do sistema YATC (Yet Another Trello Clone). As listas são os contêineres que armazenam tarefas dentro de um quadro e podem ser movidas para reorganizar o fluxo de trabalho.

## Entidade List

A entidade `List` representa uma lista no sistema e possui os seguintes atributos:

- `id`: Identificador único da lista
- `title`: Título da lista
- `position`: Posição da lista dentro do quadro (usado para ordenação)
- `board`: Referência ao quadro ao qual a lista pertence
- `createdAt`: Data de criação
- `updatedAt`: Data da última atualização

## DTOs (Data Transfer Objects)

### CreateListDto

Utilizado para criar novas listas:

```typescript
{
  title: string;       // Título da lista
  boardId: string;     // ID do quadro onde a lista será criada
  position?: number;   // Posição opcional (se não informada, será colocada no final)
}
```

### UpdateListDto

Utilizado para atualizar listas existentes:

```typescript
{
  title?: string;      // Novo título da lista (opcional)
  position?: number;   // Nova posição da lista (opcional)
}
```

### MoveListDto

Utilizado especificamente para mover listas:

```typescript
{
  position: number; // Nova posição da lista
}
```

## Endpoints da API

### GET /lists

Lista todas as listas de um quadro específico.

**Parâmetros de Query:**

- `boardId`: ID do quadro (obrigatório)

**Respostas:**

- 200: Lista de listas retornada com sucesso
- 401: Não autorizado
- 404: Quadro não encontrado
- 403: Acesso negado ao quadro

### GET /lists/:id

Retorna uma lista específica pelo ID.

**Parâmetros de Path:**

- `id`: ID da lista

**Respostas:**

- 200: Lista encontrada com sucesso
- 401: Não autorizado
- 404: Lista não encontrada
- 403: Acesso negado à lista

### POST /lists

Cria uma nova lista em um quadro.

**Body:**

- CreateListDto

**Respostas:**

- 201: Lista criada com sucesso
- 400: Dados de entrada inválidos
- 401: Não autorizado
- 404: Quadro não encontrado
- 403: Acesso negado ao quadro

### PATCH /lists/:id

Atualiza uma lista existente.

**Parâmetros de Path:**

- `id`: ID da lista

**Body:**

- UpdateListDto

**Respostas:**

- 200: Lista atualizada com sucesso
- 400: Dados de entrada inválidos
- 401: Não autorizado
- 404: Lista não encontrada
- 403: Acesso negado à lista

### PATCH /lists/:id/move

Atualiza a posição de uma lista existente.

**Parâmetros de Path:**

- `id`: ID da lista

**Body:**

- MoveListDto

**Respostas:**

- 200: Lista movida com sucesso
- 400: Dados de entrada inválidos
- 401: Não autorizado
- 404: Lista não encontrada
- 403: Acesso negado à lista

### DELETE /lists/:id

Exclui uma lista existente.

**Parâmetros de Path:**

- `id`: ID da lista

**Respostas:**

- 200: Lista excluída com sucesso
- 401: Não autorizado
- 404: Lista não encontrada
- 403: Acesso negado à lista

## Serviço ListsService

O serviço `ListsService` fornece os seguintes métodos:

- `findAll(boardId, userId)`: Retorna todas as listas de um quadro
- `findOne(id, userId)`: Retorna uma lista específica pelo ID
- `create(createListDto, userId)`: Cria uma nova lista
- `update(id, updateListDto, userId)`: Atualiza uma lista existente
- `move(id, moveListDto, userId)`: Move uma lista para uma nova posição
- `remove(id, userId)`: Exclui uma lista

## Validação de Dados

A validação dos dados de entrada é feita usando o Zod, garantindo que:

1. O título da lista tenha entre 1 e 100 caracteres
2. O ID do quadro seja um UUID válido
3. A posição seja um número inteiro não negativo

## Segurança

Todas as rotas deste módulo estão protegidas com autenticação JWT, garantindo que apenas usuários autenticados possam acessar os recursos.

Além disso, verificações adicionais garantem que apenas os proprietários dos quadros possam gerenciar suas listas.
