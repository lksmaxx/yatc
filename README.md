<p align="center">
  <h1>YATC - Yet Another Trello Clone</h1>
</p>

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## Description

YATC (Yet Another Trello Clone) is a simple task management application built for educational purposes. This project demonstrates how to build a RESTful API using NestJS framework with TypeScript.

### Features

- User authentication (register, login) with JWT
- Task management (create, read, update, delete)
- User profile management
- Postgres database integration using TypeORM
- API validation with Zod

## Project Setup

```bash
# Install dependencies
$ npm install

# Set up environment variables
# Create .env file with the following variables:
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=yatc
JWT_SECRET=your_secret_key

# Prepare test database (for E2E tests)
$ npm run test-db:prepare

# Run database migrations
$ npm run migration:run
```

## Running the Application

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Testing

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Docker Support

The project includes Docker and Docker Compose configuration for easy development and deployment:

```bash
# Start the application with Docker Compose
$ docker-compose up

# For development with hot-reload
$ docker-compose -f docker-compose.yml -f docker-compose.override.yml up
```

## Kubernetes Support

Basic Kubernetes deployment files are provided in the `k8s` directory:

```bash
# Apply Kubernetes manifests
$ kubectl apply -f k8s/postgres.yaml
$ kubectl apply -f k8s/deployment.yaml
```

## API Documentation

### Authentication Endpoints

- **POST /auth/register** - Register a new user
- **POST /auth/login** - Authenticate a user and get JWT token

### Task Endpoints

- **GET /tasks** - Get all tasks
- **GET /tasks/:id** - Get a specific task
- **POST /tasks** - Create a new task
- **PATCH /tasks/:id** - Update a task
- **DELETE /tasks/:id** - Delete a task

### User Endpoints

- **GET /users/:id** - Get user profile
- **PATCH /users/:id** - Update user profile

## License

This project is [MIT licensed](LICENSE).
