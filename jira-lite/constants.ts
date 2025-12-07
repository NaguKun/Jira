import { Status } from './types';

export const COLUMN_CONFIG = [
  { id: Status.BACKLOG, title: 'Backlog', color: 'border-l-slate-400' },
  { id: Status.IN_PROGRESS, title: 'In Progress', color: 'border-l-blue-500' },
  { id: Status.REVIEW, title: 'In Review', color: 'border-l-purple-500' },
  { id: Status.DONE, title: 'Done', color: 'border-l-green-500' },
];