import { Enum } from "typescript-string-enums"
import { auto, OPERATORS, ResolvedStreamDefMap } from '@offirmo/rx-auto'

import { retrying_fetch } from './incubator/retrying-fetch'
import { log_observable } from './incubator/rx-log'

////////////////////////////////////

//////////// CONSTANTS ////////////
const CONSTS = {
	LS_KEYS: {
		last_successful_raw_config: 'minisite-bookmark.last_successful_raw_config',
		last_successful_raw_data: 'minisite-bookmark.last_successful_raw_data',
		last_successful_password: 'minisite-bookmark.last_successful_password',
	},
	REPO_URL: 'https://github.com/Offirmo/minisite-w',
}

////////////////////////////////////

function get_vault_id() {
	return 'client01'
}

function fetch_raw_data(vault_id: string) {
	return retrying_fetch<any>(`content/${vault_id}.markdown`, undefined, {response_should_be_ok: true})
		.then(res => res.text())
}

function get_cached_raw_data(vault_id: string): string | null {
	return localStorage.getItem(CONSTS.LS_KEYS.last_successful_raw_data)
}

////////////////////////////////////


export const Status = Enum("RUNNING", "STOPPED")
export type Status = Enum<typeof Status>


const subjects = auto({
	vault_id:    get_vault_id(),
	cached_raw_data: [ 'vault_id', (deps: ResolvedStreamDefMap) => get_cached_raw_data(deps['vault_id'].value)],
	fresh_raw_data:  [ 'vault_id', (deps: ResolvedStreamDefMap) => fetch_raw_data(deps['vault_id'].value)],
	raw_data:        [ 'cached_raw_data', 'fresh_raw_data', OPERATORS.merge ]
})

for (let id in subjects) {
	//console.log(`subject ${id}`)
	log_observable(subjects[id], id)
}

////////////////////////////////////

// actions
const sbs1 = subjects['fresh_raw_data'].subscribe(x => {
	// pretend we did it...
	console.info('updated cache with fresh data:', x)
	sbs1.unsubscribe();
})

// race ?
// test every cases: cache, no cache


// trigger fetch of up to date data

// link rendering to observable
// link bkp to rendering

// trigger load from LS

// plug rendering



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

import 'packery'

console.log('App: Hello world ! XX')

//state_factory()
