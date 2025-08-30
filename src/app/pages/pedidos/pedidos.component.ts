import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { PedidoService } from '../../services/pedido/pedido.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule, NgFor, NgIf } from '@angular/common';

// Interfaces (mantidas como no seu código)
export interface Usuario {
  id: string;
  nome: string;
  email: string;
  cpf: string | null;
  cnpj: string | null;
  telefone: string | null;
  foto: string | null;
  pontos: number | null;
}

export interface ProdutoDetalhes {
  id: string;
  nome: string;
  preco: number;
  descricao: string | null;
  imagem: string | null;
}

export interface Pedido {
  id: string;
  cliente: Usuario;
  vendedor: Usuario;
  dataCriacao: string;
  dataEntrega: string;
  enderecoEntrega: string;
  remote: boolean;
}

export interface ItemPedido {
  id: string;
  quantidade: number;
  produto: ProdutoDetalhes;
  pedido: Pedido;
  vendedor: Usuario;
  comprador: Usuario;
}

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [CommonModule, RouterModule, NgIf, NgFor],
  templateUrl: './pedidos.component.html',
  styleUrl: './pedidos.component.scss',
})
export class PedidosComponent implements OnInit {
  private pedidoService = inject(PedidoService);

  public isToggled = signal(false);
  public tituloPagina = computed(() => this.isToggled() ? 'Vendas' : 'Compras');

  // Signals para pedidos comprados e vendidos
  private pedidosVendidos = toSignal(this.pedidoService.buscarPedidosVendidos(), {
    initialValue: [] as ItemPedido[],
  });
  private pedidosComprados = toSignal(this.pedidoService.buscarPedidosComprados(), {
    initialValue: [] as ItemPedido[],
  });

 page = signal(0);
  size = signal(12);
  totalElementos = signal(0);
  totalPaginas = signal(0);

  // Computed signal para as páginas visíveis
  paginasVisiveis = signal<(number | null)[]>([]);

  // Novo computed signal que reage a `isToggled` para exibir a lista correta
  public pedidosExibidos = computed(() => {
    return this.isToggled() ? this.pedidosVendidos() : this.pedidosComprados();
  });

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Usa o `subscribe` para reagir às mudanças na URL e atualizar o `isToggled`
    this.route.queryParams.subscribe(params => {
      this.isToggled.set(params['estado'] === 'vendas');
    });
  }

  ngOnInit(): void {}

  // Método para formatar datas, se necessário
  formatarData(data: string): string {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  // Método para navegar para detalhes do pedido, se necessário
  verDetalhesPedido(pedidoId: string): void {
    // Implementar navegação para uma página de detalhes, se aplicável
    // Exemplo: this.router.navigate(['/pedidos', pedidoId]);
  }

  toggle(): void {
    this.isToggled.update(value => {
      this.updateUrl(!value);
      return !value;
    });
    console.log('Botão alternado para:', this.isToggled());
  }

  private updateUrl(isToggledValue: boolean): void {
    const estado = isToggledValue ? 'vendas' : 'compras';
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { estado },
      queryParamsHandling: 'merge'
    });
  }


 // ####################### PAGINAÇÃO #########################

   gerarPaginasVisiveis(): void {
    const paginasParaExibir: Set<number> = new Set();
    const paginasTotais = this.totalPaginas();
    const paginaAtual = this.page();

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

    this.paginasVisiveis.set(paginasComReticencias);
  }

  irParaPagina(numeroPagina: number | null): void {
    if (numeroPagina !== null) {
      this.page.set(numeroPagina);
      //this.carregarDadosSimulados(); // Chame sua função real de carregar dados aqui
    }
  }

  proximaPagina(): void {
    if (this.page() < this.totalPaginas() - 1) {
      this.page.update(value => value + 1);
      //this.carregarDadosSimulados(); // Chame sua função real de carregar dados aqui
    }
  }

  paginaAnterior(): void {
    if (this.page() > 0) {
      this.page.update(value => value - 1);
      //this.carregarDadosSimulados(); // Chame sua função real de carregar dados aqui
    }
  }
}