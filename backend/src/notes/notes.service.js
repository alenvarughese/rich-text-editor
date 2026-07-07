import { Injectable, NotFoundException } from '@nestjs/common';
import { Note } from './note.entity';

@Injectable()
export class NotesService {
  // The repository is passed in by the NotesModule via a factory provider.
  // See notes.module.js for how the DataSource is used to create this repo.
  constructor(noteRepository) {
    this.noteRepository = noteRepository;
  }

  // CREATE — inserts a new row and returns the full entity with id + timestamps
  async create(createNoteDto) {
    const note = this.noteRepository.create(createNoteDto);
    return this.noteRepository.save(note);
  }

  // LIST — only select id, title, created_at to keep the list response light
  async findAll() {
    return this.noteRepository.find({
      select: { id: true, title: true, created_at: true },
      order: { created_at: 'DESC' },
    });
  }

  // GET ONE — returns the full note including the Editor.js JSON content
  async findOne(id) {
    const note = await this.noteRepository.findOne({ where: { id } });
    if (!note) {
      throw new NotFoundException(`Note #${id} not found`);
    }
    return note;
  }

  // UPDATE — merge new values onto the existing entity and save
  async update(id, updateNoteDto) {
    const note = await this.findOne(id);  // throws 404 if not found
    Object.assign(note, updateNoteDto);
    return this.noteRepository.save(note);
  }

  // DELETE — remove by id, throw 404 if missing
  async remove(id) {
    const note = await this.findOne(id);
    await this.noteRepository.remove(note);
    return { message: `Note #${id} deleted` };
  }
}
