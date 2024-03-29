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

// eslint-disable-next-line no-unused-vars
function setCookie(name, value, expirationDate) {
	var expires = expirationDate || "Fri, 31 Dec 9999 23:59:59 GMT"

	document.cookie = name + "=" + value + "; path=/; expires=" + expires + "; SameSite=Strict"
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
		for (var i = 0; i < entries.length; ++i) {
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

// eslint-disable-next-line no-unused-vars
function computeDaysBetween(latestDate, earliestDate) {
	var oneUTCDayInMilliseconds = 1000 * 60 * 60 * 24

	// compute in UTC because UTC days always lasts 24 hours (unlike in other time formats with DST)
	var earliest = Date.UTC(earliestDate.getFullYear(), earliestDate.getMonth(), earliestDate.getDate())
	var latest = Date.UTC(latestDate.getFullYear(), latestDate.getMonth(), latestDate.getDate())

	return (latest - earliest) / oneUTCDayInMilliseconds
}
