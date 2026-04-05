import { clienteService } from './clienteService'
import { contatoService } from './contatoService'
import { distribuidorService } from './distribuidorService'
import { itemPedidoService } from './itemPedidoService'
import { pedidoService } from './pedidoService'
import { produtoService } from './produtoService'
import { usuarioService } from './usuarioService'

export const entityServices = {
  clientes: clienteService,
  contatos: contatoService,
  distribuidores: distribuidorService,
  'itens-pedido': itemPedidoService,
  pedidos: pedidoService,
  produtos: produtoService,
  usuarios: usuarioService,
}
