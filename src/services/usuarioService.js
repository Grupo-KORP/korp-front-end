import { createCrudService } from './crudServiceFactory'

const baseService = createCrudService('/usuario')

function normalizeUsuario(dto) {
	if (!dto || typeof dto !== 'object') {
		return dto
	}

	const emailLooksInvalid = typeof dto.email === 'string' && !dto.email.includes('@')
	const senhaLooksLikeEmail = typeof dto.senha === 'string' && dto.senha.includes('@')

	if (emailLooksInvalid && senhaLooksLikeEmail) {
		return {
			...dto,
			email: dto.senha,
			senha: dto.email,
		}
	}

	return dto
}

export const usuarioService = {
	async list() {
		const data = await baseService.list()
		return Array.isArray(data) ? data.map(normalizeUsuario) : []
	},

	async getById(id) {
		const data = await baseService.getById(id)
		return normalizeUsuario(data)
	},

	async create(payload) {
		const data = await baseService.create(payload)
		return normalizeUsuario(data)
	},

	async update(id, payload) {
		const data = await baseService.update(id, payload)
		return normalizeUsuario(data)
	},

	async remove(id) {
		await baseService.remove(id)
	},
}
