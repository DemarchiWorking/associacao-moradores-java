import { CommonModule, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowLeft, faArrowRight, faSearch } from '@fortawesome/free-solid-svg-icons';
import { CarrinhoServiceService } from '../../services/carrinho-service.service';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/autenticacao/auth.service';
import { Router } from '@angular/router';

export interface Produto {
  id?: string;
  nome: string;
  descricao: string;
  preco: number;
  quantidade: number;
  data_criacao: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  size: number;
  number: number;
}

export interface Categoria {
  nome: string;
}

export interface Item {
  label: string;
  imagem: string;
}

@Component({
  selector: 'app-bazar',
  standalone: true,
  imports: [NgFor, NgClass, NgIf, FontAwesomeModule, CommonModule],
  templateUrl: './bazar.component.html',
  styleUrl: './bazar.component.scss'
})
export class BazarComponent implements OnInit {
  @ViewChild('productList') productList: ElementRef | undefined;
  query: string = '';
  results: string[] = [];
  faSearch = faSearch;
  faArrowLeft = faArrowLeft;
  faArrowRight = faArrowRight;

  // Propriedades de paginação
  page = 0;
  size = 12;
  totalElementos = 0;
  totalPaginas = 0;
  paginasVisiveis: (number | null)[] = []; 

  private apiUrl = 'http://localhost:8081/api';
  produtos: any[] = [];
  selectedCategoryId: number | null = null;
  carrinho: any[] = [];
  categorias: any = [];
  items = ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'];

  @ViewChild('search-input', { static: false }) searchInput!: ElementRef;
  searchText: string = '';
  categoriasStatic: any = [
    { id: 0, nome: 'Todos' , icone: '../../../assets/icones/icone-todos.png'},
    { id: 1, nome: 'Roupa', icone: '../../../assets/icones/icone-camiseta.png' },
    { id: 2, nome: 'Brinquedo', icone: '../../../assets/icones/icone-brinquedo.png' },
    { id: 3, nome: 'Decoração', icone: '../../../assets/icones/icone-decoracao.png'},
    { id: 4, nome: 'Artesanato', icone: '../../../assets/icones/icone-artesanato.png' },
    { id: 5, nome: 'Quadro', icone: '../../../assets/icones/icone-quadro.png' },
    { id: 6, nome: 'Croche', icone: '../../../assets/icones/icone-croche.png' },
  ];
  itens: Item[] = [
    { label: 'Landscape', imagem: 'https://estilopropriobysir.com/wp-content/uploads/e3258c03ac14a7d57a31fd28d22b8100.jpg' },
    { label: 'Cali', imagem: 'https://estilopropriobysir.com/wp-content/uploads/e3258c03ac14a7d57a31fd28d22b8100.jpg' },
    { label: 'City', imagem: 'https://estilopropriobysir.com/wp-content/uploads/e3258c03ac14a7d57a31fd28d22b8100.jpg' },
    { label: 'Plants', imagem: 'https://estilopropriobysir.com/wp-content/uploads/e3258c03ac14a7d57a31fd28d22b8100.jpg' },
    { label: 'Portraits', imagem: 'https://estilopropriobysir.com/wp-content/uploads/e3258c03ac14a7d57a31fd28d22b8100.jpg' },
    { label: 'NYC', imagem: 'https://estilopropriobysir.com/wp-content/uploads/e3258c03ac14a7d57a31fd28d22b8100.jpg' },
    { label: 'Chicago', imagem: 'https://estilopropriobysir.com/wp-content/uploads/e3258c03ac14a7d57a31fd28d22b8100.jpg' },
    { label: 'Nature', imagem: 'https://estilopropriobysir.com/wp-content/uploads/e3258c03ac14a7d57a31fd28d22b8100.jpg' },
    { label: 'Travel', imagem: 'https://estilopropriobysir.com/wp-content/uploads/e3258c03ac14a7d57a31fd28d22b8100.jpg' },
    { label: 'City', imagem: 'https://estilopropriobysir.com/wp-content/uploads/e3258c03ac14a7d57a31fd28d22b8100.jpg' },
    { label: 'Plants', imagem: 'https://estilopropriobysir.com/wp-content/uploads/e3258c03ac14a7d57a31fd28d22b8100.jpg' },
    { label: 'Portraits', imagem: 'https://estilopropriobysir.com/wp-content/uploads/e3258c03ac14a7d57a31fd28d22b8100.jpg' },
    { label: 'NYC', imagem: 'https://estilopropriobysir.com/wp-content/uploads/e3258c03ac14a7d57a31fd28d22b8100.jpg' },
    { label: 'Chicago', imagem: 'https://estilopropriobysir.com/wp-content/uploads/e3258c03ac14a7d57a31fd28d22b8100.jpg' },
    { label: 'Nature', imagem: 'https://estilopropriobysir.com/wp-content/uploads/e3258c03ac14a7d57a31fd28d22b8100.jpg' },
    { label: 'Plants', imagem: 'https://estilopropriobysir.com/wp-content/uploads/e3258c03ac14a7d57a31fd28d22b8100.jpg' },
    { label: 'Portraits', imagem: 'https://estilopropriobysir.com/wp-content/uploads/e3258c03ac14a7d57a31fd28d22b8100.jpg' },
    { label: 'NYC', imagem: 'https://estilopropriobysir.com/wp-content/uploads/e3258c03ac14a7d57a31fd28d22b8100.jpg' },
    { label: 'Chicago', imagem: 'https://estilopropriobysir.com/wp-content/uploads/e3258c03ac14a7d57a31fd28d22b8100.jpg' },
    { label: 'Nature', imagem: 'https://estilopropriobysir.com/wp-content/uploads/e3258c03ac14a7d57a31fd28d22b8100.jpg' },
    { label: 'Travel', imagem: 'https://estilopropriobysir.com/wp-content/uploads/e3258c03ac14a7d57a31fd28d22b8100.jpg' }
  ];

  constructor(
    private carrinhoService: CarrinhoServiceService,
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.carregarCarrinho();
    this.carregarProdutos();
    this.authService.getTokenLocalStorage();
  }

  // --- Lógica de Paginação Corrigida e Completa ---

  carregarProdutos(): void {
    const token = this.authService.getTokenLocalStorage();
    if (!token) {
      console.error('Nenhum token de autenticação encontrado. O usuário precisa fazer login.');
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    let params = new HttpParams()
      .set('page', this.page.toString())
      .set('size', this.size.toString());

    this.http.get<Page<any>>(`${this.apiUrl}/produtos`, { headers: headers, params: params })
      .subscribe({
        next: (data) => {
          this.produtos = data.content;
          this.totalElementos = data.totalElements;
          this.totalPaginas = data.totalPages;
          // Chama o método para gerar a lista de páginas
          this.gerarPaginasVisiveis();
        },
        error: (error) => {
          console.error('Erro ao carregar produtos:', error);
        }
      });
  }

  gerarPaginasVisiveis(): void {
    const paginasParaExibir: Set<number> = new Set();
    const paginasTotais = this.totalPaginas;
    const paginaAtual = this.page;
    
    // Adiciona a primeira página se existir
    if (paginasTotais > 0) {
      paginasParaExibir.add(0);
    }

    // Adiciona 2 páginas antes e 2 depois da página atual
    for (let i = -2; i <= 2; i++) {
      const pagina = paginaAtual + i;
      if (pagina >= 0 && pagina < paginasTotais) {
        paginasParaExibir.add(pagina);
      }
    }

    // Adiciona a última página se existir
    if (paginasTotais > 1) {
      paginasParaExibir.add(paginasTotais - 1);
    }

    // Cria o array final com as reticências
    const paginasOrdenadas = Array.from(paginasParaExibir).sort((a, b) => a - b);
    const paginasComReticencias: (number | null)[] = [];
    let ultimaPaginaAdicionada = -1;

    paginasOrdenadas.forEach(pagina => {
      // Se houver um salto de mais de uma página, adicione as reticências
      if (pagina > ultimaPaginaAdicionada + 1) {
        paginasComReticencias.push(null);
      }
      paginasComReticencias.push(pagina);
      ultimaPaginaAdicionada = pagina;
    });

    this.paginasVisiveis = paginasComReticencias;
  }

  irParaPagina(numeroPagina: number | null): void {
    if (numeroPagina !== null) {
      this.page = numeroPagina;
      this.carregarProdutos();
    }
  }

  proximaPagina(): void {
    if (this.page < this.totalPaginas - 1) {
      this.page++;
      this.carregarProdutos();
    }
  }

  paginaAnterior(): void {
    if (this.page > 0) {
      this.page--;
      this.carregarProdutos();
    }
  }

  // --- Outros Métodos Otimizados ---

  selectCategory(id: number) {
    this.selectedCategoryId = id;
    this.page = 0; // **Reset a paginação para a primeira página**
    const inputElement = document.getElementById('search-input') as HTMLInputElement;
    if (inputElement) {
      inputElement.value = '';
    }
    this.searchText = '';
    this.carregarProdutos(); // **Recarrega os produtos com base na nova categoria**
  }
 
  getFilteredProducts(): any[] {
    return this.produtos.filter(product => {
      const matchesCategory = this.selectedCategoryId === 0 || this.selectedCategoryId === null || product.categoria === this.selectedCategoryId;
      const matchesSearchText = this.searchText === '' || product.nome.toLowerCase().includes(this.searchText);
      return matchesCategory && matchesSearchText;
    });
  }
 
  onSearch(): void {
    const query = this.query.toLowerCase();
    if (query) {
      this.results = this.items.filter(item => item.toLowerCase().includes(query));
    } else {
      this.results = [];
    }
  }

  onSearchs(event: any) {
    this.searchText = event.target.value.toLowerCase();
  }

  scrollRight() {
    this.productList?.nativeElement.scrollBy({ left: 200, behavior: 'smooth' });
  }

  scrollLeft() {
    this.productList?.nativeElement.scrollBy({ left: -200, behavior: 'smooth' });
  }

  carregarCarrinho(): void {
    const carrinhoSalvo = sessionStorage.getItem('carrinho');
    if (carrinhoSalvo) {
      this.carrinho = JSON.parse(carrinhoSalvo);
    }
  }

  salvarCarrinho(): void {
    sessionStorage.setItem('carrinho', JSON.stringify(this.carrinho));
  }

  adicionarAoCarrinho(produto: any): void {
    this.carrinhoService.adicionarAoCarrinho(produto);
    this.carrinho = this.carrinhoService.obterCarrinho();
  }

  removerDoCarrinho(produtoId: number): void {
    this.carrinhoService.removerDoCarrinho(produtoId);
    this.carrinho = this.carrinhoService.obterCarrinho();
  }

  atualizarQuantidade(produtoId: number, quantidade: number): void {
    this.carrinhoService.atualizarQuantidade(produtoId, quantidade);
    this.carrinho = this.carrinhoService.obterCarrinho();
  }
}