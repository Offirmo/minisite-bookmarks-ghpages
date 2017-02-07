const PAD_SIZE = 6

const start = Date.now()
const pad = '000000'


// typing: let's be open about observables (+ strange TS compilation error)
// beware, will instantiate the observable (if not a subject)
function log_observable(observable: {subscribe: Function}, id: string): void {
	if (!observable) throw new Error('log_observable should be given an observable')
	if (!id) throw new Error('log_observable should be given an id')

	observable.subscribe(
		x   =>   console.log(`T=${(pad + (Date.now() - start)).slice(-PAD_SIZE)} [${id}] ..."${x}"`),
		err => console.error(`T=${(pad + (Date.now() - start)).slice(-PAD_SIZE)} [${id}] ...[Error: "${err}" !]`),
		()  =>   console.log(`T=${(pad + (Date.now() - start)).slice(-PAD_SIZE)} [${id}] ...[Completed]`)
	)
}

export {
	log_observable
}
