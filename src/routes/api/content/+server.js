export async function GET({ request, url }) {
    const isCloudflare = typeof caches !== 'undefined';

    if (isCloudflare) {
        const cacheKey = new Request(url.toString(), request);
        const cache = caches.default;
        let response = await cache.match(cacheKey);
        if (response) return response;
    }

    const raw_url = url.searchParams.get('raw_url');

    if (!raw_url) {
        return new Response('Missing raw_url query parameter', {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'GET, POST'
            },
            status: 400
        });
    }

    try {
        let result = await fetch(raw_url);
        let content = await result.text();

        let response = new Response(content, {
            headers: {
                'Cache-Control': 'public, max-age=3600',
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'GET, POST'
            }
        });

        // Put the response in the cache
        if (isCloudflare) {
            const cache = caches.default;
            const cacheKey = new Request(url.toString(), request);
            cache.put(cacheKey, response.clone());
        }

        return response;
    } catch (error) {
        let response = new Response(JSON.stringify({ "message": error.message }), {
            headers: {
                'Cache-Control': 'public, max-age=3600',
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'GET, POST'
            },
            status: 404
        });

        // Put the response in the cache
        if (isCloudflare) {
            const cache = caches.default;
            const cacheKey = new Request(url.toString(), request);
            cache.put(cacheKey, response.clone());
        }

        return response;
    }
}