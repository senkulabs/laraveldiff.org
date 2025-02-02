import { dev } from '$app/environment';
import { GITHUB_TOKEN } from '$env/static/private';
import { Octokit } from "octokit";
import { parsedLines } from '$lib/util';

const options = dev ? {
	auth: GITHUB_TOKEN
} : {};

const octokit = new Octokit(options);

/**
 * @param {string} repository
 * @param {any} baseVersion
 * @param {any} targetVersion
 */
async function getDiff(repository, baseVersion, targetVersion) {
    try {
        const [owner, repo] = repository.split('/', 2);
        /**
         * @type {any[]}
         */
        let files = [];
        // Exclude filename when get patch between two versions.
        const excludeFilenames = ['CHANGELOG.md', '.github', 'README.md', 'readme.md'];

        for await (const response of octokit.paginate.iterator(
            octokit.rest.repos.compareCommitsWithBasehead,
            {
                basehead: `${baseVersion}...${targetVersion}`,
                owner,
                per_page: 100,
                repo
            }
        )) {
            if (response.data.files) {
                files = files.concat(response.data.files).filter((file) => {
                    return !excludeFilenames.some(prefix => file.filename.startsWith(prefix));
                });

                files = files.filter((/** @type {{ sha: any; filename: any; patch: string; }} */ item) => {
                    return item.patch !== undefined;
                });
            }
        }

        const result = files.map((/** @type {{ sha: string; filename: string; status: string; raw_url: string; patch: string; }} */ item) => {
            return {
                sha: item.sha,
                filename: item.filename,
                status: item.status,
                raw_url: item.raw_url,
                base_url: `https://github.com/${repository}/blob/${baseVersion}/${item.filename}`,
                target_url: `https://github.com/${repository}/blob/${targetVersion}/${item.filename}`,
                lines: parsedLines(item.patch),
            }
        });

        return result;
    } catch (error) {
        throw new Error(`Cannot get diff between base version: ${baseVersion} and target version: ${targetVersion}`);
    }
}

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