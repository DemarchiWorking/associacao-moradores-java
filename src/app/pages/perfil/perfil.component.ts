import { NgClass, NgFor, NgIf, CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/autenticacao/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

interface Perfil {
  nome: string;
  sobrenome: string;
  status: string;
  foto: string;
  profilePicture: string;
  coverPhoto: string;
  isAlumn: boolean;
}

interface Produto {
  id: string;
  nome: string;
  preco: number;
  categoria: string;
  quantidade: number;
  imagem: string;
  icone: string | null;
  dataCriacao: string;
  steps: number;
  status: 'Iniciar Trilha' | 'Concluído' | 'Em Andamento';
  title: string;
  completion: string;
  lastActivity: string;
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [NgClass, NgIf, NgFor, RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.scss'
})
export class PerfilComponent implements OnInit {
  private apiUrl = 'http://localhost:8081/api/produtos/meus-produtos';
  private apiUsuario = 'http://localhost:8081/api/usuarios/logado';
  private apiAlterarUsuario = 'http://localhost:8081/api/usuarios/alterar';

  usuarioLogado: Perfil | null = null;
  perfilForm!: FormGroup;
  editandoPerfil = false;

  isLoading: boolean = true;
  message: string | null = null;
  isError: boolean = false;

  userProfile: Perfil = {
    nome: 'Tommy',
    foto: 'https://via.placeholder.com/150',
    sobrenome: 'Dmrch',
    status: 'Online agora',
    profilePicture: 'https://via.placeholder.com/150',
    coverPhoto: 'https://via.placeholder.com/1200x400',
    isAlumn: true
  };

  produtos: Produto[] = [];

  activeTab: 'perfil' | 'produtos' | 'vendas' = 'perfil';

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private router: Router,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    // Inicializa o formulário no ngOnInit
    this.perfilForm = this.fb.group({
      nome: [''],
      sobrenome: [''],
      foto: ['']
    });

    this.carregarProdutos();
    this.fetchUsuarioLogado();
  }

  fetchUsuarioLogado(): void {
    this.isLoading = true;
    this.message = null;
    this.isError = false;

    const token = this.authService.getTokenLocalStorage();

    if (!token) {
      this.message = 'Erro: Nenhum token de autenticação encontrado. Por favor, faça login.';
      this.isError = true;
      this.isLoading = false;
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get<any>(this.apiUsuario, { headers })
      .subscribe({
        next: (usuario) => {
          let primeiroNome = usuario.nome;
          let sobrenome = '';

          // Verifica se o nome completo tem um espaço para dividir em nome e sobrenome
          if (usuario.nome && typeof usuario.nome === 'string' && usuario.nome.includes(' ')) {
            const nomeCompleto = usuario.nome.split(' ');
            primeiroNome = nomeCompleto[0];
            sobrenome = nomeCompleto.slice(1).join(' ');
          }

          this.usuarioLogado = {
            ...usuario,
            nome: primeiroNome,
            sobrenome: sobrenome,
            foto: usuario.foto || 'https://www.llt.at/wp-content/uploads/2021/11/blank-profile-picture-g77b5d6651-1280-705x705.png',
          };
          
          if (this.usuarioLogado) {
            this.perfilForm.patchValue({
              nome: this.usuarioLogado.nome,
              sobrenome: this.usuarioLogado.sobrenome,
              foto: this.usuarioLogado.foto
            });
          }

          this.isLoading = false;
          console.log('Dados do usuário logado:', this.usuarioLogado);
        },
        error: (error) => {
          this.isError = true;
          this.isLoading = false;
          if (error.status === 401) {
            this.message = 'Sessão expirada ou não autorizada. Por favor, faça login novamente.';
          } else {
            this.message = 'Erro ao buscar dados do usuário. Por favor, tente novamente.';
          }
          console.error('Erro na requisição:', error);
        }
      });
  }

  carregarProdutos(): void {
    const token = this.authService.getTokenLocalStorage();
    console.log('Token de autenticação:', token);

    if (token) {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      this.http.get<Produto[]>(this.apiUrl, { headers: headers })
        .subscribe({
          next: (data) => {
            this.produtos = data;
            console.log('Produtos carregados com sucesso:', this.produtos);
          },
          error: (error) => {
            console.error('Erro ao carregar produtos:', error);
            if (error.status === 401 || error.status === 403) {
              console.log('Token inválido ou expirado. Redirecionando para o login.');
              this.router.navigate(['/login']);
            }
          }
        });
    } else {
      console.error('Nenhum token de autenticação encontrado. O usuário precisa fazer login.');
      this.router.navigate(['/login']);
    }
  }
  
  habilitarEdicao(): void {
    this.editandoPerfil = true;
  }

  salvarPerfil(): void {
    if (this.perfilForm.valid) {
      const dadosAtualizados = this.perfilForm.value;
      const token = this.authService.getTokenLocalStorage();

      if (!token) {
        this.message = 'Erro: Nenhum token de autenticação encontrado.';
        this.isError = true;
        return;
      }

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
      
      // Concatena nome e sobrenome em um único campo 'nome'
      const nomeCompleto = dadosAtualizados.sobrenome ? 
                           `${dadosAtualizados.nome} ${dadosAtualizados.sobrenome}` : 
                           dadosAtualizados.nome;

      // Cria um novo objeto com o nome completo para enviar à API
      const dadosParaEnviar = { ...dadosAtualizados, nome: nomeCompleto };

      this.http.patch<Perfil>(this.apiAlterarUsuario, dadosParaEnviar, { headers })
        .subscribe({
          next: (usuarioAtualizado) => {
            // Se a requisição for bem-sucedida, atualiza o objeto local
            // para que a interface reflita as mudanças.
            this.usuarioLogado = { ...this.usuarioLogado, ...usuarioAtualizado };
            this.editandoPerfil = false;
            this.message = 'Perfil atualizado com sucesso!';
            this.isError = false;
            console.log('Perfil salvo com sucesso:', usuarioAtualizado);
            
            // Recarrega a página após o salvamento bem-sucedido
            window.location.reload();
          },
          error: (error) => {
            this.isError = true;
            this.message = 'Erro ao salvar o perfil. Tente novamente.';
            console.error('Erro na requisição de atualização:', error);
          }
        });
    }
  }

  cancelarEdicao(): void {
    this.editandoPerfil = false;
    // Restaura os valores do formulário para os dados originais do usuário
    if (this.usuarioLogado) {
        this.perfilForm.patchValue({
        nome: this.usuarioLogado.nome,
        sobrenome: this.usuarioLogado.sobrenome,
        foto: this.usuarioLogado.foto
      });
    }
  }

  setActiveTab(tab: 'perfil' | 'produtos' | 'vendas'): void {
    this.activeTab = tab;
  }
}