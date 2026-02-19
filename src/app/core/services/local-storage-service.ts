import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Column } from '../interfaces/column.interface';
import { Task } from '../interfaces/task.interface';
import { Board } from '../interfaces/board.interface';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  private platformId = inject(PLATFORM_ID);

  private readonly KEYS = {
    BOARDS: 'kanban_boards',
    COLUMNS: 'kanban_columns',
    TASKS: 'kanban_tasks'
  };

  private get<T>(key: string): T[] {
    if (isPlatformBrowser(this.platformId)) {
      const data = localStorage.getItem(key);
      try {
        return data ? JSON.parse(data) : [];
      } catch {
        return [];
      }
    }
    return [];
  }

  private set<T>(key: string, data: T[]): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(key, JSON.stringify(data));
    }
  }

  setBoards(boards: Board[]) {
    this.set(this.KEYS.BOARDS, boards);
  }

  getBoards(): Board[] {
    return this.get<Board>(this.KEYS.BOARDS);
  }

  saveBoard(board: Board): void {
    const boards = this.getBoards();
    const index = boards.findIndex(b => b.id === board.id);
    index > -1 ? boards[index] = board : boards.push(board);
    this.setBoards(boards);
  }

  deleteBoard(id: string): void {
    const boards = this.getBoards().filter(b => b.id !== id);
    this.setBoards(boards);
  }

  getColumns(boardId: string): Column[] {
    return this.get<Column>(this.KEYS.COLUMNS)
      .filter(c => c.boardId === boardId)
      .sort((a, b) => a.position - b.position);
  }

  saveColumn(column: Column): void {
    const cols = this.get<Column>(this.KEYS.COLUMNS);
    const index = cols.findIndex(c => c.id === column.id);

    if (index > -1) {
      cols[index] = column;
    } else {
      cols.push(column);
    }
    this.set(this.KEYS.COLUMNS, cols);
  }

  deleteColumn(columnId: string): void {
    const cols = this.get<Column>(this.KEYS.COLUMNS).filter(c => c.id !== columnId);
    this.set(this.KEYS.COLUMNS, cols);

    const tasks = this.get<Task>(this.KEYS.TASKS).filter(t => t.columnId !== columnId);
    this.set(this.KEYS.TASKS, tasks);
  }

  getTasksByBoard(boardId: string): Task[] {
    const allColumns = this.get<Column>(this.KEYS.COLUMNS);
    const boardColumnIds = allColumns
      .filter(col => col.boardId === boardId)
      .map(col => col.id);

    return this.get<Task>(this.KEYS.TASKS)
      .filter(task => boardColumnIds.includes(task.columnId));
  }

  saveTask(task: Task): void {
    const tasks = this.get<Task>(this.KEYS.TASKS);
    const index = tasks.findIndex(t => t.id === task.id);

    if (index > -1) {
      tasks[index] = { ...tasks[index], ...task };
    } else {
      tasks.push(task);
    }
    this.set(this.KEYS.TASKS, tasks);
  }

  deleteTask(taskId: string): void {
    const tasks = this.get<Task>(this.KEYS.TASKS).filter(t => t.id !== taskId);
    this.set(this.KEYS.TASKS, tasks);
  }
}
