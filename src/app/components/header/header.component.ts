import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CarrinhoServiceService } from '../../services/carrinho-service.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [ RouterLink, CommonModule ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})

export class HeaderComponent {

    produtos: any[] = [
      { nome: 'Caneca Personalizada', foto: 'https://http2.mlstatic.com/D_NQ_NP_743292-MLU70464443042_072023-O.webp', valor: 13.20, descricao: 'Uma caneca simples e personalizada', categoria: 0 },
      // Adicione mais produtos aqui
    ];
  
    carrinho: any[] = [];
  
    constructor(private carrinhoService: CarrinhoServiceService) { }
  
    ngOnInit(): void {
      this.carrinho = this.carrinhoService.obterCarrinho();
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


