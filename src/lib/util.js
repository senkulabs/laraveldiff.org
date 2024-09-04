/**
 * @param {string | string[]} tags
 * @param {string} sourceVersion
 */
export function selectVersion(tags, sourceVersion) {
    let source = tags.slice(1);
    let getIndex = tags.indexOf(sourceVersion);
    let target = tags.slice(0, getIndex);

    return { source, target };
}