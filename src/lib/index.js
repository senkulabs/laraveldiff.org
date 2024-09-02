// place files you want to import through the `$lib` alias in this folder.
import { text } from "@sveltejs/kit";
import { Octokit } from "octokit";

const octokit = new Octokit();

/**
 * @param {string} repository
 */
export async function allTags(repository) {
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

    return tagNames;
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
            files = files.concat(response.data.files);
        }
    }

    return files;
}

/**
 * @param {any} sourceVersion
 * @param {any} targetVersion
 * @param {any} repository
 */
async function mockPatch(sourceVersion, targetVersion, repository)
{
    return [
        {
          sha: '3995a5b919ca7b365d365c7103b40e026adeb7ed',
          filename: 'CHANGELOG.md',
          status: 'modified',
          additions: 5,
          deletions: 1,
          changes: 6,
          blob_url: 'https://github.com/laravel/laravel/blob/2897a49c65a37e385d25d6606d8258e1afb39774/CHANGELOG.md',
          raw_url: 'https://github.com/laravel/laravel/raw/2897a49c65a37e385d25d6606d8258e1afb39774/CHANGELOG.md',
          contents_url: 'https://api.github.com/repos/laravel/laravel/contents/CHANGELOG.md?ref=2897a49c65a37e385d25d6606d8258e1afb39774',
          patch: '@@ -1,6 +1,10 @@\n' +
            ' # Release Notes\n' +
            ' \n' +
            '-## [Unreleased](https://github.com/laravel/laravel/compare/v11.1.2...11.x)\n' +
            '+## [Unreleased](https://github.com/laravel/laravel/compare/v11.1.3...11.x)\n' +
            '+\n' +
            '+## [v11.1.3](https://github.com/laravel/laravel/compare/v11.1.2...v11.1.3) - 2024-07-03\n' +
            '+\n' +
            '+* [11.x] Comment maintenance store by [@timacdonald](https://github.com/timacdonald) in https://github.com/laravel/laravel/pull/6429\n' +
            ' \n' +
            ' ## [v11.1.2](https://github.com/laravel/laravel/compare/v11.1.1...v11.1.2) - 2024-06-20\n' +
            ' '
        },
        {
          sha: '125949ed5a1586ad97e094c7b338a51730c2aec1',
          filename: 'config/database.php',
          status: 'modified',
          additions: 3,
          deletions: 0,
          changes: 3,
          blob_url: 'https://github.com/laravel/laravel/blob/2897a49c65a37e385d25d6606d8258e1afb39774/config%2Fdatabase.php',
          raw_url: 'https://github.com/laravel/laravel/raw/2897a49c65a37e385d25d6606d8258e1afb39774/config%2Fdatabase.php',
          contents_url: 'https://api.github.com/repos/laravel/laravel/contents/config%2Fdatabase.php?ref=2897a49c65a37e385d25d6606d8258e1afb39774',
          patch: '@@ -37,6 +37,9 @@\n' +
            "             'database' => env('DB_DATABASE', database_path('database.sqlite')),\n" +
            "             'prefix' => '',\n" +
            "             'foreign_key_constraints' => env('DB_FOREIGN_KEYS', true),\n" +
            "+            'busy_timeout' => null,\n" +
            "+            'journal_mode' => null,\n" +
            "+            'synchronous' => null,\n" +
            '         ],\n' +
            ' \n' +
            "         'mysql' => ["
        }
      ];
}

/**
 * @param {any} sourceVersion
 * @param {any} targetVersion
 * @param {any} repository
 */
export async function mapPatch(sourceVersion, targetVersion, repository)
{
    // const result = await patch(sourceVersion, targetVersion, repository);
    const result = await mockPatch(sourceVersion, targetVersion, repository);

    const mappedResult = result.map((item) => {
        return {
            sha: item.sha,
            filename: item.filename,
            lines: parsedLines(item.patch)
        }
    });
    return mappedResult;
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

const sourceVersion = '11.1.3';
const targetVersion = '11.1.4';
const repository = 'laravel/laravel';

const result = await mapPatch(sourceVersion, targetVersion, repository);

console.log(result);