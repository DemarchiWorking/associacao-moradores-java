import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PedidoRequest, PedidoResponse } from '../../pages/carrinho-compras/carrinho-compras.component';
import { catchError, Observable, throwError } from 'rxjs';
import { AuthService } from '../autenticacao/auth.service';
import { ItemPedido } from '../../pages/pedidos/pedidos.component';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {

private apiUrl = 'http://localhost:8081/api'; // Substitua pela sua URL real

  constructor(private http: HttpClient, private authService: AuthService) { }

  
  buscarPedidosVendidos(): Observable<ItemPedido[]> {
    const token = this.authService.getTokenLocalStorage();

    if (!token) {
      return throwError(() => new Error('Authentication token not found.'));
    }
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<ItemPedido[]>(`${this.apiUrl}/item/vendedor`, { headers }).pipe(
      catchError(this.handleError)
    );
  }
  buscarPedidosComprados(): Observable<ItemPedido[]> {
    const token = this.authService.getTokenLocalStorage();

    if (!token) {
      return throwError(() => new Error('Authentication token not found.'));
    }
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<ItemPedido[]>(`${this.apiUrl}/item/comprador`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  criarPedido(pedido: PedidoRequest): Observable<PedidoResponse> {
    const token = this.authService.getTokenLocalStorage();

    // Lança um erro se o token não for encontrado
    if (!token) {
      return throwError(() => new Error('Authentication token not found.'));
    }

    // Cria os headers, incluindo o de autorização
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    });
    
    // Log para depuração
    console.log('Enviando pedido:', pedido);
    
    // Envia a requisição e adiciona o tratamento de erro com .pipe()
    return this.http.post<PedidoResponse>(this.apiUrl+'/pedidos', pedido, { headers: headers }).pipe(
      catchError(this.handleError) // Chama o método de tratamento de erro
    );
  }

  /*
  buscarPedidosComprados(pedido: PedidoRequest): void {
    const token = this.authService.getTokenLocalStorage();
    if (token) {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
      this.http.get<any>(`${this.apiUrl+"/"}`, { headers }).subscribe({
        next: (produto) => {
          console.log('Dados do produto para edição:', produto);
          // Encontrar o objeto da categoria correspondente na listaDeCategorias
          const categoriaSelecionada = 
          
        },
        error: (err) => {
          console.error('Erro ao buscar dados do produto:', err);
          this.message = 'Erro ao carregar dados do produto para edição.';
          this.isError = true;
        }
      });
    }
  }*/


  // Método de tratamento de erro (exemplo)
  private handleError(error: any) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Erro do lado do cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Erro do lado do servidor
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
