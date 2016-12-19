import { State } from './types'

function factory(vault_id: string = 'demo'): State {
	return {
		vault_id
	}
}

export {
	factory
}
