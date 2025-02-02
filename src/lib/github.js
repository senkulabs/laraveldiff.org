import { dev } from '$app/environment';
import { GITHUB_TOKEN } from '$env/static/private';
import { Octokit } from "@octokit/rest";
import { parsedLines } from './util';

const options = dev ? {
	auth: GITHUB_TOKEN
} : {};

const octokit = new Octokit(options);

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

	const skipTags = ['v4.0.0-BETA4', 'v4.0.0-BETA3'];

	let filteredTagNames = tagNames.filter(tag => {
		return !skipTags.includes(tag) && !tag.startsWith('v3');
	});

	return filteredTagNames;
}

/**
 * @param {string} repository
 * @param {any} baseVersion
 * @param {any} targetVersion
 */
export async function getDiff(repository, baseVersion, targetVersion) {
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