import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Notebook } from '../lib/db';

export function useNotebooks() {
  const notebooks = useLiveQuery(
    () => db.notebooks.orderBy('updatedAt').reverse().toArray(),
    []
  );

  const createNotebook = async (title: string, coverColor: string, coverEmoji: string, coverImage?: string) => {
    const now = new Date();
    const notebookId = await db.notebooks.add({
      title,
      coverColor,
      coverEmoji,
      coverImage,
      createdAt: now,
      updatedAt: now,
    });

    // Create the first page
    await db.pages.add({
      notebookId: notebookId as number,
      content: '',
      pageNumber: 1,
      createdAt: now,
      updatedAt: now,
    });

    return notebookId;
  };

  const updateNotebook = async (id: number, updates: Partial<Notebook>) => {
    await db.notebooks.update(id, {
      ...updates,
      updatedAt: new Date(),
    });
  };

  const deleteNotebook = async (id: number) => {
    await db.transaction('rw', db.notebooks, db.pages, async () => {
      await db.pages.where('notebookId').equals(id).delete();
      await db.notebooks.delete(id);
    });
  };

  return {
    notebooks: notebooks ?? [],
    createNotebook,
    updateNotebook,
    deleteNotebook,
  };
}
