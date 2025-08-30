import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { InicialComponent } from './pages/inicial/inicial.component';
import { BazarComponent } from './pages/bazar/bazar.component';
import { IndexComponent } from './pages/index/index.component';
import { QuemSomosComponent } from './pages/quem-somos/quem-somos.component';
import { DemandasComponent } from './pages/demandas/demandas.component';
import { ContatoComponent } from './pages/contato/contato.component';
import { CadastrarProdutoComponent } from './pages/cadastrar-produto/cadastrar-produto.component';
import { DetalhesProdutoComponent } from './pages/detalhes-produto/detalhes-produto.component';
import { EntrarComponent } from './pages/entrar/entrar.component';
import { PerfilComponent } from './pages/perfil/perfil.component';
import { EditarProdutoComponent } from './pages/editar-produto/editar-produto.component';
import { CarrinhoComprasComponent } from './pages/carrinho-compras/carrinho-compras.component';
import { PedidosComponent } from './pages/pedidos/pedidos.component';
import { RegistrarComponent } from './pages/registrar/registrar.component';
export const routes: Routes = [
    {
        path: '',
        component: IndexComponent
    },
    {
        path: 'entrar',
        component: EntrarComponent
    },
    {
        path: 'perfil',
        component: PerfilComponent
    },
    {
        path: 'carrinho',
        component: CarrinhoComprasComponent
    },
    {
        path: 'pedidos',
        component: PedidosComponent
    },
    {
        path: 'registrar',
        component: RegistrarComponent
    },       
    {
        path: 'editar-produto/:id',
        component: EditarProdutoComponent
    },   
    {
        path: 'cadastrar-produto',
        component: CadastrarProdutoComponent
    },
    {
        path: 'detalhes-produto/:id', 
        component: DetalhesProdutoComponent
    },
    {
        path: 'quem-somos',
        component: QuemSomosComponent
    },
    {
        path: 'demandas',
        component: DemandasComponent
    },
    {
        path: 'inicio',
        component: IndexComponent
    },
    {
        path: 'bazar',
        component: BazarComponent
    },
    {
        path: 'demanda',
        component: DemandasComponent
    },
    {
        path: 'contato',
        component: ContatoComponent
    }
];
