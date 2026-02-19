import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { fromEvent, map, merge, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConnectionService {
  private readonly platformId = inject(PLATFORM_ID);
  
  public isOnline = signal<boolean>(true);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      
      this.isOnline.set(window.navigator.onLine);

      merge(
        fromEvent(window, 'online').pipe(map(() => true)),
        fromEvent(window, 'offline').pipe(map(() => false))
      ).subscribe(status => {
        this.isOnline.set(status);
      });
    } else {
      this.isOnline.set(true);
    }
  }


  monitorConnection(): Observable<boolean> {
    return merge(
      fromEvent(window, 'online').pipe(map(() => true)),
      fromEvent(window, 'offline').pipe(map(() => false))
    );
  }
}
