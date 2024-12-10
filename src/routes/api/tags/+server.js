import { allTags } from '$lib/github';
import { FOOBAR } from '$env/static/private';

export async function GET({ request, url }) {
    const isCloudflare = typeof caches !== 'undefined';
    
    if (isCloudflare) {
        const cacheKey = new Request(url.toString(), request);
        const cache = caches.default;
        let response = await cache.match(cacheKey);
        if (response) return response;
    }

    let json = await allTags('laravel/laravel');

    // let json = {
    //     timestamp: new Date().toISOString(),
    //     message: 'Hello there!',
    //     secret: FOOBAR,
    // };

    let response = new Response(JSON.stringify(json));

    response.headers.set('Cache-Control', 'public, max-age=3600');
    response.headers.set('Content-Type', 'application/json');
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET');

    // Put the response in the cache
    if (isCloudflare) {
        const cache = caches.default;
        const cacheKey = new Request(url.toString(), request);
        cache.put(cacheKey, response.clone());
    }

    return response;
}