import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private apiUrl = 'http://localhost:8081/api/usuarios';

  constructor(private http: HttpClient) {}

  getProdutos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }  
  
  private handleError(error: HttpErrorResponse): Observable<never> {
      console.error('An error occurred:', error);
      return throwError(() => new Error(`Error ${error.status}: ${error.message || 'Something went wrong'}`));
  }

}
