import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/autenticacao/auth.service';
import { NgFor, NgIf } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-editar-produto',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    NgFor
  ],
  templateUrl: './editar-produto.component.html',
  styleUrl: './editar-produto.component.scss'
})
export class EditarProdutoComponent {


  produtoForm!: FormGroup;
  categoriaForm!: FormGroup;

  private readonly API_CATEGORIAS = 'http://localhost:8081/api/categorias';
  private readonly API_PRODUTOS = 'http://localhost:8081/api/produtos';
  message: string | null = null;
  isError: boolean = false;
  listaDeCategorias: any[] = [];

  produtoId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    // 1. Obtém o ID do produto da URL.
    this.produtoId = this.route.snapshot.paramMap.get('id');

    // 2. Inicializa o formulário do produto com os campos e validadores.
    this.produtoForm = this.fb.group({
      nome: ['', Validators.required],
      categoria: [null, Validators.required], // Mudei para 'null' para melhor tipagem
      categoriaId: [null], // Mudei para 'null' para melhor tipagem
      preco: [null, [Validators.required, Validators.min(0.01)]],
      imagem: ['', Validators.required],
      descricao: ['', Validators.required],
    });

    // 3. Inicialização do Formulário de Categoria
    this.categoriaForm = this.fb.group({
      nome: ['', Validators.required],
      icone: ['', Validators.required],
    });

    // 4. Inicia o processo de carregamento de dados para edição.
    this.carregarDadosParaEdicao();
  }

  // Novo método para orquestrar o carregamento dos dados
  private carregarDadosParaEdicao(): void {
    if (this.produtoId) {
      // 5. Primeiro, busque todas as categorias.
      this.buscarTodasCategorias(() => {
        // 6. Depois que as categorias forem carregadas, busque o produto específico.
        this.buscarProdutoParaEdicao(this.produtoId!);
      });
    } else {
      this.isError = true;
      this.message = 'ID do produto não encontrado na URL.';
    }
  }

  get produtoNomeControl(): AbstractControl | null {
    return this.produtoForm.get('nome');
  }
  get produtoCategoriaControl(): AbstractControl | null {
    return this.produtoForm.get('categoria');
  }
  get produtoPrecoControl(): AbstractControl | null {
    return this.produtoForm.get('preco');
  }
  get produtoImagemControl(): AbstractControl | null {
    return this.produtoForm.get('imagem');
  }
  get produtoDescricaoControl(): AbstractControl | null {
    return this.produtoForm.get('descricao');
  }

  get categoriaNomeControl(): AbstractControl | null {
    return this.categoriaForm.get('nome');
  }
  get categoriaIconeControl(): AbstractControl | null {
    return this.categoriaForm.get('icone');
  }


  cadastrarCategoria() {
    this.message = null;
    this.isError = false;
    const token = this.authService.getTokenLocalStorage();
    console.log('Token de autenticação:', token);

    if (token) {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      if (this.categoriaForm.valid) {
        const novaCategoria = this.categoriaForm.value;
        console.log('Dados da Categoria para enviar:', novaCategoria);

        this.http.post<any>(this.API_CATEGORIAS, novaCategoria, { headers: headers })
          .pipe(
            finalize(() => this.buscarTodasCategorias())
          )
          .subscribe({
            next: (response) => {
              this.message = `Categoria "${response.nome}" cadastrada com sucesso!`;
              this.isError = false;
              this.categoriaForm.reset();
              console.log('Categoria cadastrada:', response);
            },
            error: (error) => {
              this.isError = true;
              if (error.status === 409) {
                this.message = 'Erro: Já existe uma categoria com este nome.';
              } else if (error.error && error.error.message) {
                this.message = `Erro ao cadastrar categoria: ${error.error.message}`;
              } else {
                this.message = 'Erro desconhecido ao cadastrar categoria. Por favor, tente novamente.';
              }
              console.error('Erro ao cadastrar categoria:', error);
            }
          });
      } else {
        this.isError = true;
        this.message = 'Por favor, preencha todos os campos da categoria corretamente.';
        this.categoriaForm.markAllAsTouched();
      }
    }
  }

  // Alterei este método para aceitar um callback, garantindo que o próximo passo só ocorra após o sucesso.
  buscarTodasCategorias(onSuccess?: () => void) {
    const token = this.authService.getTokenLocalStorage();

    if (token) {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      this.http.get<any[]>(this.API_CATEGORIAS, { headers: headers })
        .subscribe({
          next: (categorias) => {
            console.log('Todas as Categorias:', categorias);
            this.listaDeCategorias = categorias;
            // Chama o callback de sucesso se ele existir.
            if (onSuccess) {
              onSuccess();
            }
          },
          error: (error) => {
            console.error('Erro ao buscar categorias:', error);
            this.isError = true;
            this.message = 'Erro ao carregar categorias.';
          }
        });
    } else {
      console.error('Nenhum token de autenticação encontrado. O usuário precisa fazer login.');
    }
  }


  buscarProdutoParaEdicao(id: string): void {
    const token = this.authService.getTokenLocalStorage();
    if (token) {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
      this.http.get<any>(`${this.API_PRODUTOS}/${id}`, { headers }).subscribe({
        next: (produto) => {
          console.log('Dados do produto para edição:', produto);
          // Preenche o formulário com os dados do produto obtido.
          // Assumimos que a resposta da API do produto já contém o objeto de categoria completo.
          this.produtoForm.patchValue({
            nome: produto.nome,
            preco: produto.preco,
            descricao: produto.descricao,
            imagem: produto.imagem,
            // Preenche o campo 'categoria' com o objeto completo.
            categoria: produto.categoria,
          });
        },
        error: (err) => {
          console.error('Erro ao buscar dados do produto:', err);
          this.message = 'Erro ao carregar dados do produto para edição.';
          this.isError = true;
        }
      });
    }
  }
  
  editarProduto() {
  this.message = null;
  this.isError = false;
  const token = this.authService.getTokenLocalStorage();

  if (!this.produtoId) {
    console.error('ID do produto não está disponível para edição.');
    this.message = 'Erro: ID do produto não está disponível para edição.';
    this.isError = true;
    return;
  }

  if (token && this.produtoForm.valid) {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Verifica se categoria foi selecionada
    if (!this.produtoForm.value.categoria || !this.produtoForm.value.categoria.id) {
      this.message = 'Por favor, selecione uma categoria válida.';
      this.isError = true;
      this.produtoForm.markAllAsTouched();
      return;
    }

    // Cria o objeto com os dados do formulário
    const produtoAtualizado = {
      ...this.produtoForm.value,
      categoria: this.produtoForm.value.categoria.nome,
      categoriaId: this.produtoForm.value.categoria.id
    };
    delete produtoAtualizado.categoria;
    console.log('Payload enviado para a API:', produtoAtualizado);

    this.http.patch<any>(`${this.API_PRODUTOS}/${this.produtoId}`, produtoAtualizado, { headers: headers })
      .subscribe({
        next: (response) => {
          this.message = `Produto "${response.nome}" atualizado com sucesso!`;
          this.isError = false;
          console.log('Produto atualizado:', response);
        },
        error: (error) => {
          this.isError = true;
          if (error.error && error.error.message) {
            this.message = `Erro ao atualizar produto: ${error.error.message}`;
          } else {
            this.message = 'Erro desconhecido ao atualizar produto. Por favor, tente novamente.';
          }
          console.error('Erro ao atualizar produto:', error);
        }
      });
  } else {
    this.isError = true;
    this.message = 'Por favor, preencha todos os campos do produto corretamente.';
    this.produtoForm.markAllAsTouched();
  }
}
  
  onSubmitProduto() {
    this.editarProduto();
  }

  onSubmitCategoria() {
    this.cadastrarCategoria();
  }
}
