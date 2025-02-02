import { dev } from '$app/environment';
import { GITHUB_TOKEN } from '$env/static/private';
import { Octokit } from "octokit";

const options = dev ? {
    auth: GITHUB_TOKEN
} : {};

const octokit = new Octokit(options);

/**
 * @param {string} repository
 */
async function allTags(repository) {
    const [owner, repo] = repository.split('/', 2);

    /**
     * @type {any[]}
     */
    let tagNames = [];
    for await (const response of octokit.paginate.iterator(
        octokit.rest.repos.listTags,
        { owner, per_page: 100, repo }
    )) {
        tagNames = tagNames.concat(response.data.map((data) => data.name));
    }

    const skipTags = ['v4.0.0-BETA4', 'v4.0.0-BETA3'];

    let filteredTagNames = tagNames.filter(tag => {
        return !skipTags.includes(tag) && !tag.startsWith('v3');
    });

    return filteredTagNames;
}

export async function GET({ request, url }) {
    const isCloudflare = typeof caches !== 'undefined';
    
    if (isCloudflare) {
        const cacheKey = new Request(url.toString(), request);
        const cache = caches.default;
        let response = await cache.match(cacheKey);
        if (response) return response;
    }

    let json = await allTags('laravel/laravel');

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