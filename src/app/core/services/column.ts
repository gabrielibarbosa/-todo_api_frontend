import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { Column } from '../interfaces/column.interface';
import { ConnectionService } from './connection-service';
import { LocalStorageService } from './local-storage-service';
import { environment } from '../../../environments/enviroment';

@Injectable({
  providedIn: 'root',
})
export class ColumnService {
  private readonly baseUrl = environment.apiUrl;
  endpoint: string = `${this.baseUrl}/v1/column`;

  constructor(
    private http: HttpClient,
    private connectivity: ConnectionService,
    private storage: LocalStorageService
  ) { }

  getAll(boardId: string): Observable<Column[]> {
    if (this.connectivity.isOnline()) {
      return this.http.get<Column[]>(`${this.endpoint}/from/${boardId}`).pipe(
        tap(columns => {
          columns.forEach(col => this.storage.saveColumn(col));
        })
      );
    } else {
      const cachedColumns = this.storage.getColumns(boardId);
      return of(cachedColumns);
    }
  }

  insert(column: Column): Observable<any> {
    if (this.connectivity.isOnline()) {
      return this.http.post<any>(this.endpoint, column).pipe(
        tap(newCol => this.storage.saveColumn(newCol))
      );
    } else {
      this.storage.saveColumn(column);
      return of(column);
    }
  }

  update(id: string, column: Column): Observable<any> {
    if (this.connectivity.isOnline()) {
      return this.http.put<any>(`${this.endpoint}/${id}`, column).pipe(
        tap(() => this.storage.saveColumn(column))
      );
    } else {
      this.storage.saveColumn(column);
      return of(column);
    }
  }


  delete(id: string): Observable<any> {
    if (this.connectivity.isOnline()) {
      return this.http.delete<any>(`${this.endpoint}/${id}`).pipe(
        tap(() => this.storage.deleteColumn(id))
      );
    } else {
      this.storage.deleteColumn(id);
      return of({ deleted: true });
    }
  }
}
