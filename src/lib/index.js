async function allTags() {
    const response = await fetch('https://workers.laraveldiff.org/api/tags');
    return response.json();
}

export let tags = [...await allTags()];

/**
 * @param {string} sourceVersion
 * @param {string} targetVersion
 */
export async function getDiff(sourceVersion, targetVersion)
{
    const response = await fetch(`https://workers.laraveldiff.org/api/diff?source=${sourceVersion}&target=${targetVersion}`);
    return response.json();
}