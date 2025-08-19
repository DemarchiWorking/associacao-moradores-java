// src/app/components/carrinho-compras/carrinho-compras.component.ts
import { Component, OnInit } from '@angular/core';
import { CarrinhoServiceService } from '../../services/carrinho-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Importe o FormsModule aqui

@Component({
  selector: 'app-carrinho-compras',
  standalone: true,
  imports: [CommonModule, FormsModule], // Adicione FormsModule ao array imports
  templateUrl: './carrinho-compras.component.html',
  styleUrl: './carrinho-compras.component.scss'
})
export class CarrinhoComprasComponent implements OnInit {
  carrinho: any[] = [];
  frete: number = 9.99; // Valor fixo do frete

  constructor(
    private carrinhoService: CarrinhoServiceService,
  ) {
  }

  ngOnInit(): void {
    this.obterCarrinho();
  }

  obterCarrinho(): void {
    this.carrinho = this.carrinhoService.obterCarrinho();
    console.log('Carrinho de compras:', this.carrinho);
  }

  decrementarQuantidade(produto: any): void {
    this.carrinhoService.atualizarQuantidade(produto.id, produto.quantidade - 1);
    this.obterCarrinho();
  }

  incrementarQuantidade(produto: any): void {
    this.carrinhoService.atualizarQuantidade(produto.id, produto.quantidade + 1);
    this.obterCarrinho();
  }
  
  removerDoCarrinho(produtoId: number): void {
    this.carrinhoService.removerDoCarrinho(produtoId);
    this.obterCarrinho();
  }

  calcularSubtotal(): number {
    return this.carrinho.reduce((total, produto) => total + (produto.preco * produto.quantidade), 0);
  }

  calcularTotalComFrete(): number {
    return this.calcularSubtotal() + this.frete;
  }
}
