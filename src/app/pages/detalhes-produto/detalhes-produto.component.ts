import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { ProdutoService } from '../../services/produto/produto.service';
import { CarrinhoServiceService } from '../../services/carrinho-service.service';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/autenticacao/auth.service'; // Importe o AuthService

export interface Produto {
  id: string;
  nome: string;
  categoria: string;
  descricao: string;
  preco: number;
  imagem: string;
  ehAutor: boolean;
}

@Component({
  selector: 'app-detalhes-produto',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalhes-produto.component.html',
  styleUrl: './detalhes-produto.component.scss',
})
export class DetalhesProdutoComponent implements OnInit {
  produto: Produto | undefined;
  isLoading = true;
  errorMessage: string | undefined;
  carrinho: any[] = [];

  constructor(
    private produtoService: ProdutoService,
    private carrinhoService: CarrinhoServiceService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const token = this.authService.getTokenLocalStorage();
    this.carregarCarrinho();
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (id) {
          this.isLoading = true;
          this.errorMessage = undefined;
          this.produto = undefined;
          return this.produtoService.getProdutoById(id, token!);
        } else {
          this.errorMessage = 'ID do produto não encontrado na URL.';
          this.isLoading = false;
          return new Observable<Produto>();
        }
      })
    ).subscribe({
      next: (data: Produto) => {
        console.log('Dados do produto recebidos:', data);
        if (!data || !data.id || !data.nome || !data.imagem || typeof data.preco !== 'number') {
          console.error('Dados de produto inválidos ou incompletos recebidos:', data);
          this.errorMessage = 'Dados inválidos recebidos para o produto. Verifique o console para mais detalhes.';
          this.isLoading = false;
          return;
        }
        this.produto = data;
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Erro ao buscar detalhes do produto:', error);
        if (error.status === 403 || error.status === 401) { // Lidar com status de erro de autenticação
          this.errorMessage = 'Acesso negado. Por favor, faça login para visualizar este produto.';
          this.router.navigate(['/login']);
        } else if (error.status === 404) {
          this.errorMessage = 'Produto não encontrado.';
        } else {
          const backendMessage = error.error?.message || error.message;
          this.errorMessage = `Ocorreu um erro ao carregar o produto: ${backendMessage || 'Por favor, tente novamente mais tarde.'}`;
        }
        this.isLoading = false;
        this.produto = undefined;
      },
    });
  }

  //Métodos de carrinho não foram alterados
  carregarCarrinho(): void {
    const carrinhoSalvo = localStorage.getItem('carrinho');
    if (carrinhoSalvo) {
      this.carrinho = JSON.parse(carrinhoSalvo);
    }
  }

  salvarCarrinho(): void {
    localStorage.setItem('carrinho', JSON.stringify(this.carrinho));
  }

  adicionarAoCarrinho(produto: Produto): void {
    this.carrinhoService.adicionarAoCarrinho(produto);
    this.carrinho = this.carrinhoService.obterCarrinho();
    this.salvarCarrinho();
  }
}