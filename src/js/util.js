function hasCookie(name, value) {
	var nameValuePair = name + '=' + (value || '')
	return document.cookie && document.cookie.indexOf(nameValuePair) > -1
}

var parseCookies = createParser('=', ';')

// eslint-disable-next-line no-unused-vars
function getCookie(name) {
	if (!hasCookie(name)) return undefined

	var allCookies = parseCookies(document.cookie)

	return allCookies[name]
}

function hasSearchParam(name) {
	var needle = name + '='
	return window.location.search && window.location.search.indexOf(needle) > -1
}

var parseSearchParams = createParser('=', '&')

// eslint-disable-next-line no-unused-vars
function getSearchParam(name) {
	if (!hasSearchParam(name)) return undefined

	var allSearchParams = parseSearchParams(
		window.location.search.substring(1) // remove the leading question mark '?'
	)

	return allSearchParams[name]
}

function createParser(keyValueSeparator, entrySeparator) {
	return function (string) {
		if (!string) return undefined
		var result = {}

		var entries = string.split(entrySeparator)
		for(var i = 0; i < entries.length; ++i) {
			var keyValue = entries[i].split(keyValueSeparator)
			var key = decodeURIComponent(keyValue[0].trim())

			var value = undefined
			if (keyValue.length > 1) {
				value = decodeURIComponent(keyValue[1].trim())
			}

			result[key] = value
		}

		return result
	}
}
