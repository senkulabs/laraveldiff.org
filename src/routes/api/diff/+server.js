import { getDiff } from '$lib/github.js';

export async function GET({ request, url }) {
    const isCloudflare = typeof caches !== 'undefined';

    if (isCloudflare) {
        const cacheKey = new Request(url.toString(), request);
        const cache = caches.default;
        let response = await cache.match(cacheKey);
        if (response) return response;
    }

    const baseVersion = url.searchParams.get('base');
    const targetVersion = url.searchParams.get('target');

    if (!baseVersion && !targetVersion) {
        return new Response('Missing base and target query parameter', {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'GET, POST'
            },
            status: 400
        });
    }

    try {
        let base = baseVersion?.replace('v', '').split('.').map(Number) ?? [];
        let target = targetVersion?.replace('v', '').split('.').map(Number) ?? [];

        if (base[0] > target[0]) {
            return new Response('Base version must be less than target version', {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'GET, POST'
                },
                status: 400
            });
        }

        if (base[0] === target[0]) {
            if (base[1] === target[1]) {
                if (base[2] > target[2]) {
                    return new Response('Base version must be less than target version', {
                        headers: {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*',
                            'Access-Control-Allow-Headers': 'GET, POST'
                        },
                        status: 400
                    });
                }
            } else if (base[1] > target[1]) {
                return new Response('Base version must be less than target version', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Headers': 'GET, POST'
                    },
                    status: 400
                });
            }
        }

        let json = await getDiff('laravel/laravel', baseVersion, targetVersion);

        let response = new Response(JSON.stringify(json), {
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