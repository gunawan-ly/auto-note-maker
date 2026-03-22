import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Page } from '../lib/db';

export function usePages(notebookId: number | undefined) {
  const pages = useLiveQuery(
    () =>
      notebookId
        ? db.pages.where('notebookId').equals(notebookId).sortBy('pageNumber')
        : [],
    [notebookId]
  );

  const createPage = async (nbId: number, pageNumber: number) => {
    const now = new Date();
    return await db.pages.add({
      notebookId: nbId,
      content: '',
      pageNumber,
      createdAt: now,
      updatedAt: now,
    });
  };

  const updatePage = async (id: number, updates: Partial<Page>) => {
    await db.pages.update(id, {
      ...updates,
      updatedAt: new Date(),
    });
  };

  const deletePage = async (id: number) => {
    await db.pages.delete(id);
  };

  return {
    pages: pages ?? [],
    createPage,
    updatePage,
    deletePage,
  };
}
