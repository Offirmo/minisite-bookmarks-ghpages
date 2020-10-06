////////////////////////////////////

import 'marky'
const user_timing_measurement = (window as any).marky
user_timing_measurement.mark('global')
user_timing_measurement.mark('bootstrap')

import * as Rx from '@reactivex/rxjs'
import { auto, Operator, ResolvedStreamDefMap } from '@offirmo/rx-auto'
import Packery = require('packery')
import 'tachyons'
import { parseLocationParams } from '@offirmo/simple-querystring-parser'

import { retrying_fetch } from './incubator/retrying-fetch'
import { log_observable } from './incubator/rx-log'

import { Data } from './types'
import { factory as parser_factory } from './parser'
import * as TEMPLATES from './templates'

////////////

const CONSTS = {
	LS_KEYS: {
		last_successful_raw_data: (vault_id: string) => `minisite-bookmark.${vault_id}.last_successful_raw_data`,
		last_successful_password: (vault_id: string) => `minisite-bookmark.${vault_id}.last_successful_password`,
	},
	REPO_URL: 'https://github.com/Offirmo/minisite-w',
}

const dynamic_options = parseLocationParams(window.location)
console.info({dynamic_options})

const logger: Console = dynamic_options.verbose > 0
	? console
	: ({
		log: () => {},
		info: () => {},
		warn: () => {},
		error: console.error.bind(console),
		group: () => {},
		groupCollapsed: () => {},
		groupEnd: () => {},
	}) as any as Console

const { decrypt_if_needed_then_parse_data } = parser_factory({logger})

logger.log('App: Hello world !', { constants: CONSTS })

////////////////////////////////////

function get_vault_id() {
	//return 'client02b'

	let slug =
		window.location.hash.slice(1)
		// http://lea.verou.me/2016/11/url-rewriting-with-github-pages/
		|| location.pathname.split('/').filter(x => x).slice(-1)[0]
		|| 'default'

	// GitHub demo
	if (slug === 'minisite-bookmarks-ghpages')
		slug = 'default'

	// dev local
	if (slug === '404.html')
		slug = 'default'
	if (slug === 'index.html')
		slug = 'default'
	if (slug === 'index-dev.html')
		slug = 'default'

	return slug
}

function fetch_raw_data(vault_id: string): Promise<string> {
	user_timing_measurement.mark('fetch_raw_data')
	return retrying_fetch<any>(`content/${vault_id}.markdown`, undefined, {
		response_should_be_ok: true,
		logger,
	})
		.then(res => {
			user_timing_measurement.stop('fetch_raw_data')
			return res.text()
		})
}

function get_cached_raw_data(vault_id: string): string | Rx.Observable<any> {
	const cached_data = localStorage.getItem(CONSTS.LS_KEYS.last_successful_raw_data(vault_id))
	return cached_data ?
		cached_data:
		Rx.Observable.empty()
}

function get_password$() {
	// TODO !
	/*
	const input = document.querySelector('password-input')
	return Rx.Observable
		.fromEvent(input, 'click')
		.debounceTime(250)
		*/
	return Rx.Observable.create((observer: Rx.Observer<string>) => {
		observer.next('') // no password
		// never
	})
}

function get_cached_password(vault_id: string): string | Rx.Observable<any> {
	const cached_data = localStorage.getItem(CONSTS.LS_KEYS.last_successful_password(vault_id))
	return cached_data
		? cached_data
		: Rx.Observable.empty()
}

function render(data: Data) {
	if (!data) return

	user_timing_measurement.mark('render')

	logger.group('rendering...')
	logger.log('source data', data)

	window.document.title = data.title

	let new_html_content
	if(! data.rows.length) {
		new_html_content = '<h2>Empty ! Please add some data...'
	}
	else {
		new_html_content =  TEMPLATES.page(data)
	}
	logger.log('html generated')

	const el_content = document.querySelectorAll('#content')[0]
	el_content.innerHTML = new_html_content
	logger.log('html replaced')

	const elems = Array.from(document.querySelectorAll('.grid'))
	const pks = elems.map(elem => new (Packery as any)( elem!, {
		itemSelector: '.grid-item',
		// stamp elements
		stamp: '.stamp',
		// assist column width to cleanly adapt to variable-width titles
		columnWidth: elem.classList.contains('pinned') ? 72 : 144,
		//rowHeight: 36,
		//gutter: 1,
		percentPosition: false,
		initLayout: false, // disable initial layout
	}))
	logger.log('Packery created on all elements')

	// attach our event handlers before running the layout
	const all_layouts_done = Promise.all(pks.map(pckry => new Promise(resolve => pckry.once('layoutComplete', resolve))))
	all_layouts_done
	.then(() => {
		logger.info('All packery layouts done')
		user_timing_measurement.stop('render')
		user_timing_measurement.stop('global')
	})
	.catch(e => logger.error(e))

	pks.forEach(pckry => pckry.layout())
	logger.log('Packery layout launched on all elements')

	logger.groupEnd()
}

function render_error(err: Error) {
	logger.error('something wrong occurred:', err)
	const el_content = document.querySelectorAll('#content')[0]
	el_content.innerHTML = 'Something wrong occured :-( (Look at the console if you are a dev)'
	user_timing_measurement.stop('global')
}

////////////////////////////////////

setTimeout(() => {
	user_timing_measurement.mark('rx setup')

	const subjects = auto({

		////////////////////////////////////
		vault_id:
			get_vault_id,

		////////////////////////////////////
		cached_raw_data: [
			'vault_id',
			(deps: ResolvedStreamDefMap) => get_cached_raw_data(deps['vault_id'].value)
		],
		fresh_raw_data: [
			'vault_id',
			(deps: ResolvedStreamDefMap) => fetch_raw_data(deps['vault_id'].value)
		],
		raw_data: [
			'cached_raw_data',
			'fresh_raw_data',
			Operator()
				.concat()
				.distinctUntilChanged()
		],

		////////////////////////////////////
		cached_password: [
			'vault_id',
			(deps: ResolvedStreamDefMap) => get_cached_password(deps['vault_id'].value)
		],
		fresh_password:
			get_password$,
		password: [
			'cached_password',
			'fresh_password',
			Operator()
				.concat()
				.distinctUntilChanged()
		],

		////////////////////////////////////
		data: [
			'vault_id',
			'raw_data',
			'password',
			Operator().combineLatest({
				project: decrypt_if_needed_then_parse_data
			})
		],


		/*
		 data_source: [
		 'vault_id',
		 'raw_data',
		 'password',
		 //			OPERATORS.combineLatestHashDistinctUntilChangedShallow
		 OPERATORS.combineLatestHash
		 ],
		 data: [
		 'data_source',
		 ({data_source}: ResolvedStreamDefMap) => data_source.observable$.map(v => {
		 const {vault_id, raw_data, password} = v
		 console.warn('source to feed', v, decrypt_if_needed_then_parse_data)
		 return decrypt_if_needed_then_parse_data(vault_id, raw_data, password)
		 })
		 ],*/
	}, {
		logger: console,
		validate: true,
	})

	// actions

	if (dynamic_options.verbose > 0) {
		for (let id in subjects) {
			log_observable(subjects[id].plain$, id)
			//log_observable(subjects[id].behavior$, id + 'B')
		}
	}

	console.info('Subscribing to data...')
	subjects['data'].behavior$.subscribe({
		next: render,
		error: render_error,
		complete: () => logger.log('data plain$ done'),
	})

	let sbs1 = subjects['data'].behavior$.subscribe(data => {
		if (!data) return
		// successful parse: store this good data
		localStorage.setItem(CONSTS.LS_KEYS.last_successful_raw_data(data.vault_id), data.raw_data)
		localStorage.setItem(CONSTS.LS_KEYS.last_successful_password(data.vault_id), data.password)
		logger.info('updated cache with fresh data')
		setTimeout(() => sbs1.unsubscribe())
	})

	user_timing_measurement.stop('rx setup')
})

user_timing_measurement.stop('bootstrap')

////////////////////////////////////
