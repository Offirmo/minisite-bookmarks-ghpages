////////////////////////////////////

function parse(location: Location): { [k: string]: number | string | string[] } {
	const raw_options =
		location.search.split('?').slice(-1)[0].split('&')

	return raw_options.reduce((acc, raw_option) => {
			if (!raw_option) return acc

			const [ key, value ] = raw_option.split('=')

			acc[key] = `${Number(value)}`=== value
				? Number(value)
				: value.indexOf(',') >= 0
					? value.split(',')
					: value
			return acc
		}, {})
}

////////////////////////////////////

export {
	parse
}

////////////////////////////////////