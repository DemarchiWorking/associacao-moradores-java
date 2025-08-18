import { NgFor } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowLeft, faArrowRight, faSearch } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-contato',
  standalone: true,
  imports: [ NgFor, FontAwesomeModule],
  templateUrl: './contato.component.html',
  styleUrl: './contato.component.scss'
})
export class ContatoComponent {
  @ViewChild('productList') productList: ElementRef | undefined;
  query: string = '';
  results: string[] = [];
  faSearch = faSearch;
  faArrowLeft = faArrowLeft;
  faArrowRight = faArrowRight;
  items = ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'];
  categorias: any = [
    { id: 0, nome: 'Todos' , icone: '../../../assets/icones/icone-todos.png'},
    { id: 1, nome: 'Roupa', icone: '../../../assets/icones/icone-camiseta.png' },//  croche 
    { id: 2, nome: 'Brinquedo', icone: '../../../assets/icones/icone-brinquedo.png' },
    { id: 3, nome: 'Decoração', icone: '../../../assets/icones/icone-decoracao.png'},
    { id: 4, nome: 'Artesanato', icone: '../../../assets/icones/icone-artesanato.png' },
    { id: 5, nome:  'Quadro', icone: '../../../assets/icones/icone-quadro.png' },
    { id: 6, nome: 'Croche', icone: '../../../assets/icones/icone-croche.png'  },
   ];

  produtos: any = [
    { nome: 'Caneca Personalizada', foto: 'https://cdn.dooca.store/102992/products/4ksuhbkynhawbusba4piqchgeruzvhqjmwjj_600x800+fill_ffffff.jpg?v=1732310702', valor: 5, descricao: 'Uma caneca simples e personalizada', categoria: 0 },
    { nome: 'Camiseta Estilosa', valor: 5, descricao: 'Uma camiseta moderna e confortável', categoria: 1 },
    { nome: 'Brinquedo Educativo', valor: 5, descricao: 'Um brinquedo que ensina e diverte', categoria: 2 },
    { nome: 'Almofada Decorada', valor: 5, descricao: 'Uma almofada decorativa para sua casa', categoria: 3 },
    { nome: 'Escultura Artesanal', valor: 5, descricao: 'Uma escultura feita à mão', categoria: 4 },
    { nome: 'Quadro Artístico', valor: 5, descricao: 'Um quadro para embelezar sua parede', categoria: 5 },
    { nome: 'Toalha de Croche', valor: 5, descricao: 'Uma toalha de croche feita à mão', categoria: 6 },
  ];

  selectedCategoryId: number | null = null;


  products = Array.from({ length: 20 }, (_, index) => ({
    icon: 'path/to/icon.png', // Replace with the actual path to your icons
    description: `Product Category ${index + 1}`
  }));


  selectCategory(id: number) {
    this.selectedCategoryId = id;
  }
  getFilteredProducts():any[] {
    if (this.selectedCategoryId === 0 || this.selectedCategoryId === null) {
      return this.produtos;
    }
    return this.produtos.filter((product: any) => product.categoria === this.selectedCategoryId);
  }
  onSearch(): void {
    const query = this.query.toLowerCase();
    if (query) {
      this.results = this.items.filter(item => item.toLowerCase().includes(query));
    } else {
      this.results = [];
    }
  }

  scrollRight() {
    this.productList?.nativeElement.scrollBy({ left: 200, behavior: 'smooth' });
  }

  scrollLeft() {
    this.productList?.nativeElement.scrollBy({ left: -200, behavior: 'smooth' });
  }
}

