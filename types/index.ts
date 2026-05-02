import { JSONContent } from '@tiptap/react';

export interface Page {
  id: string;
  title: string;
  content?: string | JSONContent;
  parentId: string | null;
  icon?: string | null;
  coverImage?: string | null;
  fullWidth?: boolean;
  isLocked?: boolean;
  isFavorite?: boolean;
  isTrashed?: boolean;
  createdAt?: any;
  updatedAt?: any;
  userId: string;
}
