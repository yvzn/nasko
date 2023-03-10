function hasCookie(name, value) {
	const allCookies = document.cookie
	let nameValuePair = name + '=' + (value || '')
	return allCookies && allCookies.indexOf(nameValuePair) > -1
}

function hasQueryStringOverride(name) {
	let needle = name + '='
	return window.location.search && window.location.search.indexOf(needle) > -1
}
