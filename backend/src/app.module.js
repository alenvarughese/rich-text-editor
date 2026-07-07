import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { NotesModule } from './notes/notes.module';

@Module({
  imports: [
    // Load .env file values into process.env globally
    ConfigModule.forRoot({ isGlobal: true }),

    // TypeORM connection — reads from .env via process.env
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 3306,
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'notes_db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      // synchronize: true auto-creates/updates the DB table from the entity.
      // Handy for learning, but DISABLE in production — use migrations instead.
      synchronize: true,
    }),

    NotesModule,
  ],
})
export class AppModule {}
