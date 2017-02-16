////////////////////////////////////

import * as Rx from '@reactivex/rxjs'
import { auto, OPERATORS, ResolvedStreamDefMap } from '@offirmo/rx-auto'
import * as whenDomReady from 'when-dom-ready'


import { retrying_fetch } from './incubator/retrying-fetch'
import { log_observable } from './incubator/rx-log'
import { Data } from './types'

//////////// CONSTANTS ////////////
const CONSTS = {
	LS_KEYS: {
		last_successful_raw_config: 'minisite-bookmark.last_successful_raw_config',
		last_successful_raw_data: (vault_id: string) => `minisite-bookmark.${vault_id}.last_successful_raw_data`,
		last_successful_password: (vault_id: string) => `minisite-bookmark.${vault_id}.last_successful_password`,
	},
	REPO_URL: 'https://github.com/Offirmo/minisite-w',
}

////////////////////////////////////

function get_vault_id() {
	// TODO improve
	return 'client01'
}

function fetch_raw_data(vault_id: string) {
	return retrying_fetch<any>(`content/${vault_id}.markdown`, undefined, {response_should_be_ok: true})
		.then(res => res.text())
}

function get_cached_raw_data(vault_id: string): string | Rx.Observable<any> {
	const cached_data = localStorage.getItem(CONSTS.LS_KEYS.last_successful_raw_data(vault_id))
	return cached_data ?
		cached_data:
		Rx.Observable.empty()
}

function get_password$() {
	/*
	const input = document.querySelector('password-input');
	return Rx.Observable
		.fromEvent(input, 'click')
		.debounceTime(250)
		*/
	return Rx.Observable.create(function (observer) {
		observer.next('') // no password
		// never
	})
}

function get_cached_password(vault_id: string): string | Rx.Observable<any> {
	const cached_data = localStorage.getItem(CONSTS.LS_KEYS.last_successful_password(vault_id))
	return cached_data ?
		cached_data:
		Rx.Observable.empty()
}

function decrypt_and_parse_data(raw_data: string, password: string = ''): Data {
	console.log('decrypt_and_parse_data', arguments)

	return {
		raw_data,
		password,
		top_bar: [],
		rows: [],
	}
}

////////////////////////////////////

console.log('App: Hello world !')

const subjects = auto({
	vault_id: get_vault_id,
	cached_raw_data: [
		'vault_id',
		(deps: ResolvedStreamDefMap) => get_cached_raw_data(deps['vault_id'].value)
	],
	fresh_raw_data:  [
		'vault_id',
		(deps: ResolvedStreamDefMap) => fetch_raw_data(deps['vault_id'].value)
	],
	raw_data:        [
		'cached_raw_data',
		'fresh_raw_data',
		OPERATORS.concat
	],
	cached_password: [
		'vault_id',
		(deps: ResolvedStreamDefMap) => get_cached_password(deps['vault_id'].value)
	],
	fresh_password: get_password$,
	password:        [
		'cached_password',
		'fresh_password',
		OPERATORS.concat
	],
	data:            [
		'raw_data',
		'password',
		({raw_data, password}: ResolvedStreamDefMap) => Rx.Observable.combineLatest(
			raw_data.observable$,
			password.observable$,
			decrypt_and_parse_data
		)
	],
	is_dom_ready: whenDomReady(),
})

for (let id in subjects) {
	//console.log(`subject ${id}`)
	log_observable(subjects[id].plain$, id)
}

////////////////////////////////////

// actions
let sbs1 = subjects['fresh_raw_data'].plain$.subscribe(x => {
	// pretend we did it...
	console.info('updated cache with fresh data')
	sbs1.unsubscribe()
})


//import * as tachyons from 'tachyons'
/*
declare var Packery:
import { Packery } from 'packery'
*/
/*
var pckry = new Packery('.pckry', {
	// options...
})
*/

import 'packery'



subjects['data'].plain$.subscribe({
	next: x => console.log('got value, TODO RENDER:', x),
	error: err => console.error('something wrong occurred: ' + err),
	complete: () => console.log('done'),
});

