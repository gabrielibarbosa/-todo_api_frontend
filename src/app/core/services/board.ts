

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { ConnectionService } from './connection-service';
import { Board } from '../interfaces/board.interface';
import { LocalStorageService } from './local-storage-service';
import { environment } from '../../../environments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  private readonly baseUrl = environment.apiUrl;
  endpoint: string = `${this.baseUrl}/v1/board`; 

  constructor(
    private http: HttpClient,
    private connectivity: ConnectionService,
    private storage: LocalStorageService
  ) {}

  getAll(): Observable<Board[]> {
    if (this.connectivity.isOnline()) {
      return this.http.get<Board[]>(this.endpoint).pipe(
        tap(boards => {
          
          this.storage.setBoards(boards); 
        })
      );
    } else {
      const cachedBoards = this.storage.getBoards();
      return of(cachedBoards);
    }
  }


  insert(board: Board): Observable<any> {
    if (this.connectivity.isOnline()) {
      return this.http.post<any>(this.endpoint, board).pipe(
        tap(newBoard => this.storage.saveBoard(newBoard))
      );
    } else {
      this.storage.saveBoard(board);
      return of(board); 
    }
  }

  
  update(id: string, board: Board): Observable<any> {
    if (this.connectivity.isOnline()) {
      return this.http.put<any>(`${this.endpoint}/${id}`, board).pipe(
        tap(() => this.storage.saveBoard(board))
      );
    } else {
      this.storage.saveBoard(board);
      return of(board);
    }
  }

  delete(id: string): Observable<any> {
    if (this.connectivity.isOnline()) {
      return this.http.delete<any>(`${this.endpoint}/${id}`).pipe(
        tap(() => this.storage.deleteBoard(id))
      );
    } else {
      this.storage.deleteBoard(id);
      return of({ deleted: true });
    }
  }
}
