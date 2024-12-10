/**
 * @param {string} sourceVersion
 * @param {string | string[]} tags
 */
export function selectVersion(sourceVersion, tags) {
    let base = tags.slice(1);
    let getIndex = tags.indexOf(sourceVersion);
    let target = tags.slice(0, getIndex);

    return { base, target };
}