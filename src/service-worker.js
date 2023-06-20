// https://github.com/mdn/serviceworker-cookbook/tree/master/strategy-network-or-cache

// eslint-disable-next-line no-undef
var P = Promise

var CACHE = 'v1'

// On install, cache some resource.
self.addEventListener('install', function (evt) {
	// Ask the service worker to keep installing until the returning promise
	// resolves.
	evt.waitUntil(precache())
})

// Enable navigation preload
function enableNavigationPreload() {
	if (self.registration.navigationPreload) {
		return self.registration.navigationPreload.enable();
	}
	return P.resolve();
}

self.addEventListener("activate", function (evt) {
	evt.waitUntil(enableNavigationPreload())
})

// On fetch, use cache but update the entry with the latest contents
// from the server.
self.addEventListener('fetch', function (evt) {
	// Try network and if it fails, go for the cached copy.
	evt.respondWith(
		fromNetwork(evt.request, 400)
			.catch(function () {
				return fromPreloadResponse(evt.request, evt.preloadResponse)
					.catch(function () {
						return fromCache(evt.request)
							.catch(function () {
								return fromCache('/408/')
							})
					})
			}))
})

// Open a cache and use `addAll()` with an array of assets to add all of them
// to the cache. Return a promise resolving when all the assets are added.
function precache() {
	return caches.open(CACHE).then(function (cache) {
		return cache.addAll([
			"/",
			"/408/",
			"/css/style.css",
			"/assets/hi-res/crib.png",
			"/assets/hi-res/corgi.png",
			"/assets/favicon.ico",
			"/assets/favicon.svg"
		])
	})
}

function putInCache(request, response) {
	return caches.open(CACHE).then(function (cache) {
		return cache.put(request, response)
	})
}

// Time limited network request. If the network fails or the response is not
// served before timeout, the promise is rejected.
function fromNetwork(request, timeout) {
	return new P(function (fulfill, reject) {
		// Reject in case of timeout.
		var timeoutId = setTimeout(reject, timeout)
		// Fulfill in case of success.
		fetch(request).then(function (response) {
			clearTimeout(timeoutId)
			putInCache(request, response.clone())
			fulfill(response)
			// Reject also if network fetch rejects.
		}, reject)
	})
}

// Open the cache where the assets were stored and search for the requested
// resource. Notice that in case of no matching, the promise still resolves
// but it does with `undefined` as value.
function fromCache(request) {
	return caches.open(CACHE).then(function (cache) {
		return cache.match(request).then(function (matching) {
			return matching || P.reject('no-match')
		})
	})
}

function fromPreloadResponse(request, preloadResponsePromise) {
	return new P(function (fulfill, reject) {
		if (preloadResponsePromise) {
			preloadResponsePromise.then(function (response) {
				if (response) {
					putInCache(request, response.clone())
					fulfill(response)
				}
				reject('no-preload-response')
			}, reject)
		}
		reject('no-preload-response')
	})
}
