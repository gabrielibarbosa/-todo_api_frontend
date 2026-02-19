import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { Task } from '../interfaces/task.interface';
import { ConnectionService } from './connection-service';
import { LocalStorageService } from './local-storage-service';
import { environment } from '../../../environments/enviroment';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private readonly baseUrl = environment.apiUrl;
  endpoint: string = `${this.baseUrl}/v1/task`;

  constructor(
    private http: HttpClient,
    private connectivity: ConnectionService,
    private storage: LocalStorageService
  ) { }


  getAll(boardId: string): Observable<Task[]> {
    if (this.connectivity.isOnline()) {
      return this.http.get<Task[]>(`${this.endpoint}/from/${boardId}`).pipe(
        tap(tasks => {
          tasks.forEach(t => this.storage.saveTask(t));
        })
      );
    } else {
      const cachedTasks = this.storage.getTasksByBoard(boardId);
      return of(cachedTasks);
    }
  }

  insert(task: Task): Observable<any> {
    if (this.connectivity.isOnline()) {
      return this.http.post<any>(this.endpoint, task).pipe(
        tap(newTask => this.storage.saveTask(newTask))
      );
    } else {
      this.storage.saveTask(task);
      return of(task);
    }
  }

  update(id: string, task: Task): Observable<any> {
    if (this.connectivity.isOnline()) {
      return this.http.put<any>(`${this.endpoint}/${id}`, task).pipe(
        tap(() => this.storage.saveTask(task))
      );
    } else {
      this.storage.saveTask(task);
      return of(task);
    }
  }

  delete(id: string): Observable<any> {
    if (this.connectivity.isOnline()) {
      return this.http.delete<any>(`${this.endpoint}/${id}`).pipe(
        tap(() => this.storage.deleteTask(id))
      );
    } else {
      this.storage.deleteTask(id);
      return of({ deleted: true });
    }
  }
}
