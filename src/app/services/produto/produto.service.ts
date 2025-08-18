import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError, map } from 'rxjs';
import { Produto } from '../../pages/detalhes-produto/detalhes-produto.component'; // Adjust the import path as necessary
@Injectable({
  providedIn: 'root',
})
export class ProdutoService {
  private apiUrl = 'http://localhost:8081/api/produtos';

  constructor(private http: HttpClient) {}

  getProdutoById(id: string, token: string): Observable<any> {
    // 1. Crie os HttpHeaders com o token recebido como argumento
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // 2. Passe os headers como um objeto de opções para o método get
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers: headers }).pipe(
      map((response) => ({
        id: response.id.toString(),
        nome: response.nome || response.name,
        descricao: response.descricao || response.description,
        preco: Number(response.preco || response.price),
        imagem: response.imagem || response.image,
        ehAutor: response.ehAutor,
      })),
      catchError(this.handleError)
    );
  }

  getProdutos(): Observable<Produto[]> {
    return this.http.get<Produto[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  createProduto(produto: Produto): Observable<Produto> {
    return this.http.post<Produto>(this.apiUrl, produto).pipe(
      catchError(this.handleError)
    );
  }

  updateProduto(id: string, produto: Produto): Observable<Produto> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<Produto>(url, produto).pipe(
      catchError(this.handleError)
    );
  }

  deleteProduto(id: string): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('An error occurred:', error);
    return throwError(() => new Error(`Error ${error.status}: ${error.message || 'Something went wrong'}`));
  }
}