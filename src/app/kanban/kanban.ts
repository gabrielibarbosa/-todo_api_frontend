import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray, transferArrayItem, CdkDropListGroup } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Board } from '../core/interfaces/board.interface';
import { Column } from '../core/interfaces/column.interface';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { Task } from '../core/interfaces/task.interface';
import { BoardService } from '../core/services/board';
import { ColumnService } from '../core/services/column';
import { TaskService } from '../core/services/task';
import { forkJoin } from 'rxjs';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ColumnForm } from './column-form/column-form';
import { LocalStorageService } from '../core/services/local-storage-service';
import { TaskForm } from './task-form/task-form';
import { MatListModule } from '@angular/material/list';
import { BoardForm } from './board-form/board-form';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';


@Component({
  selector: 'app-kanban',
  imports: [
    FormsModule,
    CdkDrag,
    CdkDropList,
    CdkDropListGroup,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatCardModule,
    MatChipsModule,
    MatProgressBarModule,
    DatePipe,
    MatListModule,
    MatTooltipModule,
    MatCheckboxModule
  ],
  providers: [BoardService, ColumnService, TaskService],
  templateUrl: './kanban.html',
})
export class Kanban implements OnInit {
  private boardService = inject(BoardService);
  private columnService = inject(ColumnService);
  private taskService = inject(TaskService);
  private localStorageService = inject(LocalStorageService);


  private dialog = inject(MatDialog);

  readonly boardList = signal<Board[]>([]);
  readonly columnsBoard = signal<Column[]>([]);
  readonly taskList = signal<Task[]>([])
  readonly boardSelecionado = signal<Board | null>(null);

  public tasksByColumn = computed(() => {
    const tasks = this.taskList();
    const map: Record<string, Task[]> = {};

    tasks.forEach(task => {
      if (!map[task.columnId]) map[task.columnId] = [];
      map[task.columnId].push(task);
    });

    return map;
  });

  constructor() {

    effect(() => {
      const selected = this.boardSelecionado();
      if (selected) {
        this.getColumnsBoard(selected.id);
      }
    });
  }

  ngOnInit(): void {
    this.getListBoard();
  }

  getListBoard() {
    this.boardService.getAll().subscribe({
      next: (list) => this.boardList.set(list),
      error: (err) => console.error('Erro ao listar boards', err)
    });
  }

  getColumnsBoard(boardId: string) {
    this.columnService.getAll(boardId).subscribe({
      next: (columns) => {
        this.columnsBoard.set(columns);

        if (columns.length > 0) {
          this.getTasksFromColumns(columns);
        } else {
          this.taskList.set([]);
        }
      },
      error: (err) => console.error('Erro ao carregar colunas', err)
    });
  }

  private getTasksFromColumns(columns: Column[]) {
    const requests = columns.map(col => this.taskService.getAll(col.id));

    forkJoin(requests).subscribe({
      next: (allTasksArrays: Task[][]) => {
        const flattenedTasks = allTasksArrays.flat();
        this.taskList.set(flattenedTasks);
      },
      error: (err) => console.error('Erro ao carregar tasks das colunas', err)
    });
  }

  dropColumn(event: CdkDragDrop<any[]>) {
    const currentColumns = [...this.columnsBoard()];

    moveItemInArray(currentColumns, event.previousIndex, event.currentIndex);
    this.columnsBoard.set(currentColumns);

    currentColumns.forEach((col, index) => {
      if (col.position !== index) {
        col.position = index;
        this.columnService.update(col.id, col).subscribe();
      }
    });
  }

  drop(event: CdkDragDrop<Task[]>) {

    const previousData = event.previousContainer.data;
    const currentData = event.container.data;

    if (!previousData || !currentData) {
      console.error('Dados da lista não encontrados');
      return;
    }

    if (event.previousContainer === event.container) {
      moveItemInArray(
        currentData,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        previousData,
        currentData,
        event.previousIndex,
        event.currentIndex
      );

      const targetColumnId = event.container.id;
      const task = event.item.data as Task;

      this.updateTaskInBackend(task, targetColumnId);
    }
  }

  private updateTaskInBackend(task: Task, newColumnId: string) {
    const updatedTask: Task = {
      ...task,
      columnId: newColumnId
    };

    this.taskService.update(task.id, updatedTask).subscribe({
      next: () => {
        this.loadDataTask()
        console.log('Sucesso: Task movida no banco de dados');

      },
      error: (err) => {
        console.error('Erro ao mover task no servidor:', err);
        this.loadDataTask();
      }
    });
  }

  getConnectedList(): string[] {
    return this.columnsBoard().map(col => col.id);
  }


  deleteColumn(id: string) {
    this.columnService.delete(id).subscribe(() => {
      this.columnsBoard.set(this.columnsBoard().filter(c => c.id !== id));
    });
  }

  deleteTask(id: string) {
    this.taskService.delete(id).subscribe(() => {
      this.taskList.set(this.taskList().filter(c => c.id !== id));
    });
  }

  loadDataColumn() {
    const boardId = this.boardSelecionado()?.id;

    if (!boardId) {
      console.warn('Tentativa de carregar dados sem um Board ID definido.');
      return;
    }

    const cols = this.localStorageService.getColumns(boardId);
    this.columnsBoard.set(cols);
  }

  loadDataTask() {
    const boardId = this.boardSelecionado()?.id;

    if (!boardId) {
      console.warn('Tentativa de carregar dados sem um Board ID definido.');
      return;
    }

    const task = this.localStorageService.getTasksByBoard(boardId);
    this.taskList.set(task);
  }

  openDialogColumn(column?: Column) {
    const dialogRef = this.dialog.open(ColumnForm, {
      width: '600px',
      data: { boardId: this.boardSelecionado()?.id, column }
    });

    dialogRef.afterClosed().subscribe(columnData => {
      if (columnData) {
        const newColumn = {
          ...columnData,
          boardId: this.boardSelecionado()?.id
        };

        if (column) {
          this.updateColumn(newColumn)
        } else {
          this.insertNewColumn(newColumn)
        }
      }
    });
  }

  updateColumn(column: Column) {
    this.columnService.update(column.id, column).subscribe({
      next: () => {
        this.loadDataColumn();
      },
      error: (err) => console.error('Erro ao sincronizar edição da coluna:', err)
    });
  }

  insertNewColumn(newColumn: Column) {
    this.columnService.insert(newColumn).subscribe({
      next: () => {
        this.loadDataColumn();
      },
      error: (err) => console.error('Erro ao sincronizar nova coluna:', err)
    });
  }

  openDialogTask(columnId?: string, task?: Task) {
    const dialogRef = this.dialog.open(TaskForm, {
      width: '600px',
      data: { columnId }
    });

    dialogRef.afterClosed().subscribe(taskData => {
      if (taskData) {
        const newTask: Task = {
          ...taskData,
          columnId: columnId,
          createdAt: Date.now().toLocaleString(),
          dueDate: Date.now().toLocaleString(),
        };

        if (task) {
          this.updateTask(newTask)
        } else {
          this.insertNewTask(newTask)
        }
      }
    });
  }

  updateTask(task: Task) {
    this.taskService.update(task.id, task).subscribe({
      next: () => {
        this.loadDataTask();
      },
      error: (err) => console.error('Erro ao sincronizar edição da task:', err)
    });
  }
  insertNewTask(newTask: Task) {
    this.taskService.insert(newTask).subscribe({
      next: () => {
        this.loadDataTask();
      },
      error: (err) => console.error('Erro ao sincronizar nova task:', err)
    });
  }


  openDialogBoard(edit?: string) {
    const board = this.boardSelecionado()
    const dialogRef = this.dialog.open(BoardForm, {
      width: '300px',
      data: { board }
    });

    dialogRef.afterClosed().subscribe(boardData => {
      if (boardData) {
        if (edit) {
          this.updateBoard(boardData)
        } else {
          this.insertNewBoard(boardData)
        }
      }
    });
  }

  updateBoard(boardData: Board) {
    const boardId = this.boardSelecionado()?.id;
    if (!boardId) {
      console.error('Não é possível atualizar: Nenhum Board selecionado.');
      return;
    }
    this.boardService.update(boardId, boardData).subscribe({
      next: () => {
        this.getListBoard()
      },
      error: (err) => console.error('Erro ao sincronizar edição do board:', err)
    });
  }
  insertNewBoard(newBoard: Board) {
    this.boardService.insert(newBoard).subscribe({
      next: () => {
        this.getListBoard()
      },
      error: (err) => console.error('Erro ao sincronizar novo board:', err)
    });
  }

  transformDate(value: any): number | string {
    if (typeof value === 'string') {
      const cleanValue = value.replace(/\./g, '');
      const num = Number(cleanValue);
      return isNaN(num) ? value : num;
    }
    return value;
  }
}

