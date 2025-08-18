import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CarrinhoServiceService {

    private carrinho: any[] = [];
  
    constructor() {
      this.carregarCarrinho();
    }
  
    private salvarCarrinho(): void {
      sessionStorage.setItem('carrinho', JSON.stringify(this.carrinho));
    }
  
    private carregarCarrinho(): void {
      const carrinhoSalvo = sessionStorage.getItem('carrinho');
      if (carrinhoSalvo) {
        this.carrinho = JSON.parse(carrinhoSalvo);
      }
    }
  
    private gerarIdUnico(): number {
      return Math.floor(Math.random() * 1000000);
    }
  
    adicionarAoCarrinho(produto: any): void {
      const itemExistente = this.carrinho.find(item => item.nome === produto.nome);
      if (itemExistente) {
        itemExistente.quantidade += 1;
      } else {
        produto.id = this.gerarIdUnico();
        this.carrinho.push({ ...produto, quantidade: 1 });
      }
      this.salvarCarrinho();
      console.log(this.carrinho);
    }
  
    removerDoCarrinho(produtoId: number): void {
      this.carrinho = this.carrinho.filter(item => item.id !== produtoId);
      this.salvarCarrinho();
      console.log(this.carrinho);
    }
  
    atualizarQuantidade(produtoId: number, quantidade: number): void {
      const itemExistente = this.carrinho.find(item => item.id === produtoId);
      if (itemExistente) {
        itemExistente.quantidade = quantidade;
        if (itemExistente.quantidade <= 0) {
          this.removerDoCarrinho(produtoId);
        } else {
          this.salvarCarrinho();
        }
      }
    }
  
    obterCarrinho(): any[] {
      return this.carrinho;
    }
  }