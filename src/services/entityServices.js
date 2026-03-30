import { clienteService } from './clienteService'
import { contatoService } from './contatoService'
import { distribuidorService } from './distribuidorService'
import { usuarioService } from './usuarioService'

export const entityServices = {
  clientes: clienteService,
  contatos: contatoService,
  distribuidores: distribuidorService,
  usuarios: usuarioService,
}
