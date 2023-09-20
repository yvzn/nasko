// https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers

const CACHE_VERSION = "v0.6"

const addResourcesToCache = async (resources) => {
	const cache = await caches.open(CACHE_VERSION)
	await cache.addAll(resources)
}

const putInCache = async (request, response) => {
	const cache = await caches.open(CACHE_VERSION)
	await cache.put(request, response)
}

const deleteOldCacheVersion = async () => {
	var cacheNames = await caches.keys();
	for (const cache of cacheNames) {
		if (cache !== CACHE_VERSION) {
			console.log('delete ', cache)
			await caches.delete(cache)
		}
	}
}

const FETCH_TIMEOUT = 30 * 1000

const fetchWithTimeout = (request, timeoutInMilliseconds) => {
	const controller = new AbortController()
	const timeout = setTimeout(function () { controller.abort() }, timeoutInMilliseconds)
	try {
		return fetch(request, { signal: controller.signal })
	} finally {
		clearTimeout(timeout)
	}
}

const refreshCacheFromNetwork = async (request) => {
	try {
		const responseFromNetwork = await fetchWithTimeout(request, FETCH_TIMEOUT)
		await putInCache(request, responseFromNetwork.clone())
		return responseFromNetwork
	} catch (error) {
		return new Response("Network error happened", {
			status: 408,
			headers: { "Content-Type": "text/plain" },
		})
	}
}

const cacheFirst = async ({ request, preloadResponsePromise, fallbackUrl }) => {
	// try to use the preloaded response, if it's there
	let preloadResponse = undefined
	try {
		preloadResponse = await preloadResponsePromise
	} catch (error) {
		preloadResponse = undefined
	}

	// try to get the resource from the cache
	const responseFromCache = await caches.match(request, { ignoreSearch: true })
	if (responseFromCache) {
		if (!preloadResponse) {
			refreshCacheFromNetwork(request)
		}
		return responseFromCache
	}

	// try to use the preloaded response, if it's there
	if (preloadResponse) {
		putInCache(request, preloadResponse.clone())
		return preloadResponse
	}

	// try to get the resource from the network
	try {
		const responseFromNetwork = await fetchWithTimeout(request, FETCH_TIMEOUT)
		// response may be used only once
		// we need to save clone to put one copy in cache
		// and serve second one
		putInCache(request, responseFromNetwork.clone())
		return responseFromNetwork
	} catch (error) {
		const fallbackResponse = await caches.match(fallbackUrl)
		if (fallbackResponse) {
			return fallbackResponse
		}
		// when even the fallback response is not available,
		// there is nothing we can do, but we must always
		// return a Response object
		return new Response("Network error happened", {
			status: 408,
			headers: { "Content-Type": "text/plain" },
		})
	}
}

// Enable navigation preload
const enableNavigationPreload = async () => {
	if (self.registration.navigationPreload) {
		await self.registration.navigationPreload.enable()
	}
}

self.addEventListener("activate", (event) => {
	event.waitUntil(enableNavigationPreload())
	deleteOldCacheVersion()
})

self.addEventListener("install", (event) => {
	const criticalAssets = [
		"/",
		"/408/",
		"/css/style.css",
		"/fr/consentement-cookies/",
		"/fr/estimation-date-debut-grossesse/",
	]

	const lessCriticalAssets = [
		"/fr/menu/",
		"/fr/",
		"/assets/lo-res/corgi.png"
	]

	event.waitUntil(addResourcesToCache(criticalAssets))
	addResourcesToCache(lessCriticalAssets)
})

self.addEventListener("fetch", (event) => {
	const fallbackUrl = event.request.destination === "image" ? "/assets/lo-res/corgi.png" : "/408/"

	event.respondWith(
		cacheFirst({
			request: event.request,
			preloadResponsePromise: event.preloadResponse,
			fallbackUrl
		})
	)
})
