import { NgClass, NgFor, NgIf, CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { AuthService } from '../../services/autenticacao/auth.service';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, debounceTime, distinctUntilChanged, Observable, of, Subject, switchMap, throwError } from 'rxjs';
import { EnderecoService } from '../../services/endereco/endereco.service';

interface Perfil {
  nome: string;
  sobrenome: string;
  status: string;
  telefone: string;
  foto: string;
  profilePicture: string;
  coverPhoto: string;
  isAlumn: boolean;
}
export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}
interface Usuario {
  id: string;
}

export interface EnderecoPayload {
  cidade: string;
  estado: string;
  cep: string;
  rua: string;
  numero: number;
  adicional: string;
  bairro: string;
  complemento: string;
  usuario: Usuario;
}
export interface EnderecoResponse extends EnderecoPayload {
  id: string; 
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
  imports: [NgClass, NgIf, NgFor, RouterLink, ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.scss'
})
export class PerfilComponent implements OnInit {
  private apiUrl = 'http://localhost:8081/api/produtos/meus-produtos';
  private apiUsuario = 'http://localhost:8081/api/usuarios/logado';
  private apiAlterarUsuario = 'http://localhost:8081/api/usuarios/alterar';
  contagemCaracteres: number = 0;

  usuarioLogado: Perfil | null = null;
  perfilForm!: FormGroup;
  enderecoForm!: FormGroup;
  editandoPerfil = false;

  isLoading: boolean = true;
  message: string | null = null;
  isError: boolean = false;

  userProfile: Perfil = {
    nome: 'Tommy',
    foto: 'https://via.placeholder.com/150',
    sobrenome: 'Dmrch',
    telefone: '123-456-7890',
    status: 'Online agora',
    profilePicture: 'https://via.placeholder.com/150',
    coverPhoto: 'https://via.placeholder.com/1200x400',
    isAlumn: true
  };

  produtos: Produto[] = [];

  activeTab: 'perfil' | 'produtos' | 'vendas' = 'perfil';
  enderecoExistente: EnderecoResponse | null = null;

  loadingCep = signal(false);
  cepSubject = new Subject<string>();

  cepError = signal<string | null>(null);


  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private router: Router,
    private fb: FormBuilder,
    private enderecoService: EnderecoService
  ) { }

  ngOnInit(): void {
    // Inicializa o formulário no ngOnInit
    this.perfilForm = this.fb.group({
      nome: [''],
      sobrenome: [''],
      foto: [''],
      telefone: [''],
    });
    this.buscarEndereco();

    this.enderecoForm = this.fb.group({
      cidade: ['', Validators.required],
      estado: ['', Validators.required],
      cep: ['', Validators.required],
      rua: ['', Validators.required],
      numero: [null],
      adicional: [''],
      bairro: ['', Validators.required],
      complemento: [''],
      isSemNumero: [false]
    })
    this.enderecoForm.get('isSemNumero')?.valueChanges.subscribe(value => {
      const numeroControl = this.enderecoForm.get('numero');
      if (value) {
        numeroControl?.disable();
        numeroControl?.setValue(''); // Opcional: limpa o valor quando desabilitado
      } else {
        numeroControl?.enable();
      }
    });

    this.cepSubject.pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap(cep => {
          if (this.enderecoForm.get('cep')?.valid) {
            this.loadingCep.set(true);
            this.cepError.set(null);
            return this.enderecoService.buscarCep(cep).pipe(
              catchError(err => {
                this.cepError.set(err.message);
                this.loadingCep.set(false);
                return of(null);
              })
            );
          }
          return of(null);
        })
      ).subscribe((data: ViaCepResponse | null) => {
        this.loadingCep.set(false);
        if (data && !data.erro) {
          this.enderecoForm.patchValue({
            estado: data.uf,
            cidade: data.localidade,
            bairro: data.bairro,
            rua: data.logradouro,
            complemento: data.complemento,
          });
          this.cepError.set(null);
        } else if (data?.erro) {
          this.cepError.set('CEP não encontrado.');
          this.clearAddressFields();
        }
      });


      this.enderecoForm.get('adicional')?.valueChanges.subscribe(value => {
        this.contagemCaracteres = value.length;
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
  enderecoParaCadastrar: EnderecoPayload = {
    cidade: 'Rio de Janeiro',
    estado: 'RJ',
    cep: '20000-000',
    rua: 'Avenida Atlântica',
    numero: 1000,
    adicional: 'Bloco A',
    bairro: 'Copacabana',
    complemento: 'Apartamento 101',
    usuario: { id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef'}
  };

  buscarEndereco(): void {
    this.enderecoService.buscarEnderecoDoUsuarioLogado().subscribe({
      next: (endereco: EnderecoResponse) => {
        this.enderecoExistente = endereco;
        this.enderecoForm.patchValue(endereco);
        console.log('Endereço encontrado e preenchido:', endereco);
      },
      error: (error: HttpErrorResponse) => {
        
        if (error.status === 404) {
          console.log('Nenhum endereço encontrado para o usuário. Prepare para cadastrar.');
          this.enderecoExistente = null; // Garante que o estado seja limpo
        } else {
          console.error('Erro ao buscar o endereço:', error);
          this.isError = true;
          this.message = 'Erro ao buscar seu endereço. Tente novamente mais tarde.';
        }
      }
    });
  }
  cadastrarEndereco(): void {
    console.log('Formulário válido?', this.enderecoForm.valid);
    console.log('Valores do formulário:', this.enderecoForm.getRawValue());
    if (this.enderecoForm.valid) {
      const formValue = this.enderecoForm.getRawValue();
      const enderecoPayload: EnderecoPayload = {
        cidade: formValue.cidade,
        estado: formValue.estado,
        cep: formValue.cep,
        rua: formValue.rua,
        numero: formValue.isSemNumero ? null : formValue.numero, // Envia null se isSemNumero for true
        adicional: formValue.adicional,
        bairro: formValue.bairro,
        complemento: formValue.complemento,
        usuario: { id : '' } // Usa o ID do usuário logado
      };

      this.enderecoService.cadastrarEndereco(enderecoPayload).subscribe({
        next: (response: EnderecoResponse) => {
          console.log('Endereço cadastrado com sucesso:', response);
          this.message = 'Endereço cadastrado com sucesso!';
          this.isError = false;
          this.enderecoForm.reset(); 
        },
        error: (error) => {
          console.error('Falha ao cadastrar o endereço:', error);
          console.log('Status:', error.status);
          console.log('Mensagem:', error.message);
          this.message = `Falha ao cadastrar o endereço: ${error.message || 'Por favor, tente novamente.'}`;
          this.isError = true;
        }
      });
    } else {
      this.message = 'Por favor, preencha todos os campos obrigatórios.';
      this.isError = true;
      this.enderecoForm.markAllAsTouched();
    }
  }
  salvarEndereco(): void {
    this.message = null;
    this.isError = false;

    if (this.enderecoForm.valid) {
      const enderecoPayload = this.enderecoForm.getRawValue();

      if (this.enderecoExistente && this.enderecoExistente.id) {
        enderecoPayload.id = this.enderecoExistente.id;
        this.enderecoService.atualizarEndereco(enderecoPayload).subscribe({
          next: (response) => {
            this.message = 'Endereço atualizado com sucesso!';
            this.isError = false;
            console.log('Endereço atualizado:', response);
            this.enderecoExistente = response; // Atualiza o estado local
          },
          error: (error) => {
            this.isError = true;
            this.message = `Falha ao atualizar o endereço: ${error.message}`;
          }
        });
      } else {
        this.enderecoService.cadastrarEndereco(enderecoPayload).subscribe({
          next: (response) => {
            this.message = 'Endereço cadastrado com sucesso!';
            this.isError = false;
            console.log('Endereço cadastrado:', response);
            this.enderecoExistente = response; // Armazena o novo endereço com o ID
          },
          error: (error) => {
            this.isError = true;
            this.message = `Falha ao cadastrar o endereço: ${error.message}`;
          }
        });
      }
    } else {
      this.message = 'Por favor, preencha todos os campos obrigatórios.';
      this.isError = true;
      this.enderecoForm.markAllAsTouched();
    }
  }

  
   cepValidator() {
    return (control: import('@angular/forms').AbstractControl) => {
      const cep = control.value;
      if (!cep) return null;
      const cleanedCep = cep.replace(/\D/g, '');
      return /^\d{8}$/.test(cleanedCep) ? null : { invalidCep: true };
    };
  }

  onCepChange(): void {
    const cep = this.enderecoForm.get('cep')?.value;
    if (cep) {
      this.cepSubject.next(cep);
    }
  }

  
  onCepHelp(): void {
    window.open('https://buscacepinter.correios.com.br/', '_blank');
  }

  private clearAddressFields(): void {
    this.enderecoForm.patchValue({
      estado: '',
      cidade: '',
      bairro: '',
      rua: '',
      complemento: '',
    });
  }
  /*
  onCepChange(): void {
    const cepControl = this.enderecoForm.get('cep');

    if (cepControl && cepControl.valid) {
      const cep = cepControl.value;

      this.enderecoService.buscarCep(cep).subscribe({
        next: (data: ViaCepResponse) => {
          if (data.erro) {
            console.error('CEP não encontrado ou formato inválido.');
            // Opcional: Limpar os campos e notificar o usuário
            this.enderecoForm.patchValue({
              estado: '',
              cidade: '',
              bairro: '',
              rua: '',
              complemento: '',
            });
          } else {
            // Atualiza apenas os campos retornados pela API
            this.enderecoForm.patchValue({
              estado: data.uf,
              cidade: data.localidade,
              bairro: data.bairro,
              rua: data.logradouro,
              complemento: data.complemento,
            });
          }
        },
        error: (err) => {
          console.error(err);
          // Opcional: Tratar erros de requisição
        },
      });
    }
  }*/


/*
  onCepHelp(): void {
    console.log("Abrir link para busca de CEP");  
  }*/

     public buscarCep(cep: string): Observable<ViaCepResponse> {

    const cleanedCep = cep.replace(/\D/g, '');
    const url = `https://viacep.com.br/ws/${cleanedCep}/json/`;

    return this.http.get<ViaCepResponse>(url).pipe(
      catchError(this.handleViaCepError)
    );
  }

  private handleViaCepError(error: HttpErrorResponse): Observable<never> {
    if (error.status === 400 || error.status === 404) {
      console.error('CEP not found or invalid format.');

      return throwError(() => new Error('CEP não encontrado ou formato inválido.'));
    }
    return throwError(() => new Error(`Erro ${error.status}: ${error.message || 'Something went wrong with ViaCEP request'}`));
  }

}

