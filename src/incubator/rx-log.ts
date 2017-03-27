/* Log an observable's events
 * BEWARE this may instantiate the observable (if not a subject)
 * -> USE WITH CAUTION
*/
////////////////////////////////////

const PAD_SIZE = 6

const start_date = Date.now()
const zeros_for_pad = '000000'
let auto_id = 0

///////

// typing: let's be open about observables (+ strange TS compilation error)
interface LooseObservable {
	subscribe: Function
}

///////

function to_string_but_not_too_big(x: any): string {
	const s = (typeof x === 'undefined') ? 'undefined' : x.toString()
	const eol_index = s.indexOf('\n')
	let nice = (eol_index > 0)
		? s.slice(0, eol_index) + '...'
		: s
	if (nice.length > 30)
		nice = nice.slice(0, 30) + '...'
	return nice
}

function generate_timestamp() {
	return `T=${(zeros_for_pad + (Date.now() - start_date)).slice(-PAD_SIZE)}`
}

function log_observable(observable: LooseObservable, id?: string): void {
	auto_id++
	if (!observable) throw new Error('log_observable should be given an observable')
	id = id || `#${auto_id}`

	observable.subscribe(
		(value: any) => {
			const val_s = to_string_but_not_too_big(value)
			if (val_s !== '[object Object]')
				console.log(`${generate_timestamp()} [${id}] ..."${val_s}"`)
			else
				console.log(`${generate_timestamp()} [${id}] ...`, value)
		},
		(err: Error) =>
			console.error(`${generate_timestamp()} [${id}] ...[Error: "${err}" !]`),
		() =>
			console.log(`${generate_timestamp()} [${id}] ...[Completed]`)
	)
}

////////////////////////////////////

export {
	LooseObservable,
	log_observable
}

////////////////////////////////////
