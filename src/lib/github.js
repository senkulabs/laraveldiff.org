// place files you want to import through the `$lib` alias in this folder.
import { Octokit } from "octokit";
import { mockTags } from "./mockData";

const octokit = new Octokit();

// Exclude filename when get patch between two versions.
const excludeFilenames = ['CHANGELOG.md', '.github', 'README.md'];

/**
 * @param {string} repository
 */
export async function allTags(repository) {
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 3000);
    })
    
    const [owner, repo] = repository.split('/', 2);
    try {
        const fetchTags = async () => {
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

            return tagNames;
        };

        const tagNames = await Promise.race([fetchTags(), timeoutPromise]);

        // TODO: Cache it because GitHub has API rate limit.
        return tagNames;
    } catch (error) {
        console.error("Opps, we get API error limit from GitHub API");
        return mockTags();
    }
}

let tags = [...await allTags('laravel/laravel')];

export let sourceTag = (tags.length > 0) ? tags[1] : '';

/**
 * @param {string} sourceVersion
 */
export function selectVersion(sourceVersion) {
    let source = tags.slice(1);
    let getIndex = tags.indexOf(sourceVersion);
    let target = tags.slice(0, getIndex);

    return { source, target };
}

/**
 * @param {string} sourceVersion
 * @param {string} targetVersion
 * @param {string} repository
 */
export async function patch(sourceVersion, targetVersion, repository)
{
    const [owner, repo] = repository.split('/', 2);
    /**
     * @type {any[]}
     */
    let files = [];

    for await (const response of octokit.paginate.iterator(
        octokit.rest.repos.compareCommitsWithBasehead,
        {
            basehead: `v${sourceVersion}...v${targetVersion}`,
            owner,
            per_page: 100,
            repo
        }
    )) {
        if (response.data.files) {
            files = files.concat(response.data.files).filter((file) => {
                return !excludeFilenames.some(prefix => file.filename.startsWith(prefix));
            });
            console.log(files);
        }
    }

    // TODO: Cache it! Because GitHub has API rate limit.
    return files;
}

/**
 * @param {any} sourceVersion
 * @param {any} targetVersion
 * @param {any} repository
 */
export async function getDiff(sourceVersion, targetVersion, repository)
{
    console.log('source version', sourceVersion);
    console.log('target version', targetVersion);

    sourceVersion = sourceVersion.substring(1);
    targetVersion = targetVersion.substring(1);
    
    if ((parseInt(targetVersion) - parseInt(sourceVersion)) > 1) {
        throw new Error(`Please upgrade to the next version incrementally (e.g., from version ${parseInt(sourceVersion)} to ${parseInt(sourceVersion) + 1}). Skipping versions (e.g., from version ${sourceVersion} to ${targetVersion}) is not supported.`);
    }

    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 3000);
    });

    try {
        const result = await Promise.race([patch(sourceVersion, targetVersion, repository), timeoutPromise]);

        const mappedResult = result.map((/** @type {{ sha: any; filename: any; patch: string; }} */ item) => {
            return {
                sha: item.sha,
                filename: item.filename,
                lines: parsedLines(item.patch)
            }
        });
        
        return mappedResult;
    } catch (error) {
        throw new Error('Opps, we get API error limit from GitHub API');
    }
}

/**
 * @param {string} diffString
 */
function parsedLines(diffString) {
    const lines = diffString.split('\n');

    const parsedLines = lines.map((/** @type {string} */ line, /** @type {number} */ index) => {
        let status = 'unchanged';

        // Check the first character of the line to determine the status
        if (line.startsWith('+')) {
            status = 'add';
        } else if (line.startsWith('-')) {
            status = 'remove';
        }

        return {
            number: index + 1,
            text: line,
            status: status
        }
    });

    return parsedLines;
}