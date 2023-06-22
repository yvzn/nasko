// https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers

const addResourcesToCache = async (resources) => {
	const cache = await caches.open("v1")
	await cache.addAll(resources)
}

const putInCache = async (request, response) => {
	const cache = await caches.open("v1")
	await cache.put(request, response)
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
	// First try to get the resource from the cache
	const responseFromCache = await caches.match(request, { ignoreSearch: true })
	if (responseFromCache) {
		refreshCacheFromNetwork(request)
		return responseFromCache
	}

	// Next try to use (and cache) the preloaded response, if it's there
	const preloadResponse = await preloadResponsePromise
	if (preloadResponse) {
		console.info("using preload response", preloadResponse)
		putInCache(request, preloadResponse.clone())
		return preloadResponse
	}

	// Next try to get the resource from the network
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
})

self.addEventListener("install", (event) => {
	const criticalAssets = [
		"/",
		"/408/",
		"/css/style.css",
		"/fr/consentement-cookies/",
		"/fr/estimation-date-naissance/",
	]

	const lessCriticalAssets = [
		"/fr/menu/",
		"/fr/",
		"/assets/lo-res/corgi.png"
	]

	addResourcesToCache(lessCriticalAssets)
	event.waitUntil(addResourcesToCache(criticalAssets))
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
