import { Module } from '@nestjs/common';
import { TypeOrmModule, getDataSourceToken } from '@nestjs/typeorm';
import { Note } from './note.entity';
import { NotesService } from './notes.service';
import { NotesController } from './notes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Note])],
  controllers: [NotesController],
  providers: [
    // Factory provider — creates the TypeORM repository and injects it
    // into NotesService as a plain constructor argument.
    // This avoids the need for @InjectRepository() parameter decorator.
    {
      provide: NotesService,
      useFactory: (dataSource) => {
        const noteRepository = dataSource.getRepository(Note);
        return new NotesService(noteRepository);
      },
      // The DataSource token is used to get the TypeORM DataSource from DI.
      inject: [getDataSourceToken()],
    },
  ],
  exports: [NotesService],
})
export class NotesModule {}
