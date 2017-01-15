declare const fetch: any

import { Observable } from 'rxjs'

var source = Rx.Observable.from([1, 2, 3]);
var subject = new Rx.Subject();
var multicasted = source.multicast(subject);

catch + delay

const CONSTS = {
	LS_KEYS: {
		last_successful_raw_data: 'minisite-bookmarks.last_successful_raw_data',
	}
}

// determine vault id
const VAULT_ID = 'demo'

// create observables

const O_latest_cached_raw = Observable.create(observer => {
	const data = localStorage.getItem(CONSTS.LS_KEYS.last_successful_raw_data)
	if (data) observer.onNext(data)
})

const O_latest_fetched_raw = Observable.create(observer => {
	// TODO fetch
})


const latest_model = null
const latest_raw = null

const latest_fetched_raw = null


///


function fetch_content(vault_id: string): Promise<string> {
	return fetch(`content/${vault_id}.markdown`)
	.then(res => res.text())
	.then()
}

function fetch_raw_content(vault_id: string): Promise<string> {
	return fetch(`content/${vault_id}.markdown`)
	.then(res => res.text())
}

// trigger fetch of up to date data

// link rendering to observable
// link bkp to rendering

// trigger load from LS

// plug rendering






import 'packery'

//import { factory as state_factory } from './state'

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

console.log('App: Hello world ! XX')

//state_factory()
