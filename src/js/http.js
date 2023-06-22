var REQUEST_TIMEOUT = 10 * 1000

function xhrGet(url, responseType, successCallback, errorCallback) {
	var request = new XMLHttpRequest()
	request.addEventListener("load", requestListener)
	request.addEventListener("error", errorCallback)
	request.addEventListener("timeout", errorCallback)
	request.timeout = REQUEST_TIMEOUT
	request.responseType = responseType
	request.open("GET", url, true)
	request.send()

	function requestListener() {
		if (request.readyState === 4) {
			if (request.status === 200) {
				successCallback(request.response)
			} else {
				errorCallback(request.statusText)
			}
		}
	}
}

function isFetchSupported() {
	try {
		return Boolean(window.fetch)
	} catch (e) {
		return false
	}
}

function fetchGet(url, responseType, successCallback, errorCallback) {
	var controller = new AbortController()

	var timeout = setTimeout(function () { controller.abort() }, REQUEST_TIMEOUT)

	fetch(url, { signal: controller.signal })
		.then(function (response) {
			if (!response.ok) {
				errorCallback(response)
			} else if (responseType === 'json') {
				response.json().then(successCallback).catch(errorCallback)
			} else if (responseType === 'text') {
				response.text().then(successCallback).catch(errorCallback)
			}
		})
		.catch(errorCallback)
		.finally(function () { clearTimeout(timeout) });
}

// eslint-disable-next-line no-unused-vars
var http = {
	get: xhrGet
}

if (isFetchSupported()) {
	http.get = fetchGet
}
