import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('notes')         // Maps this class to a MySQL table called "notes"
export class Note {
  @PrimaryGeneratedColumn()  // Auto-increment integer primary key
  id;

  @Column({ type: 'varchar', length: 255 })
  title;

  // Editor.js output is a JSON object like { time, blocks: [...], version }
  // MySQL's json column stores it efficiently and lets you query inside it.
  @Column({ type: 'json' })
  content;

  @CreateDateColumn()    // TypeORM auto-sets this on INSERT
  created_at;

  @UpdateDateColumn()    // TypeORM auto-updates this on every UPDATE
  updated_at;
}
