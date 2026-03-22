import Dexie, { type Table } from 'dexie';

export interface Notebook {
  id?: number;
  title: string;
  coverColor: string;
  coverEmoji: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Page {
  id?: number;
  notebookId: number;
  content: string;
  pageNumber: number;
  createdAt: Date;
  updatedAt: Date;
}

class AutoNoteDB extends Dexie {
  notebooks!: Table<Notebook>;
  pages!: Table<Page>;

  constructor() {
    super('AutoNoteDB');
    this.version(1).stores({
      notebooks: '++id, title, createdAt, updatedAt',
      pages: '++id, notebookId, pageNumber, createdAt, updatedAt',
    });
  }
}

export const db = new AutoNoteDB();
