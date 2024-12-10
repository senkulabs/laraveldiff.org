/**
 * @param {string} baseVersion
 * @param {string | string[]} tags
 */
export function selectVersion(baseVersion, tags) {
    let updatedBase = tags.slice(1);
    let getIndex = tags.indexOf(baseVersion);
    let target = tags.slice(0, getIndex);
    let filteredTarget = target.filter((/** @type {string} */ item) => {
        let base = baseVersion.replace('v', '').split('.').map(Number);
        let target = item.replace('v', '').split('.').map(Number);

        // NOTE: We only allowed one version above the base version for incremental upgrade.
        // This is intended for make upgrade process easier
        // E.g. if the base version is 9 then it only allowed up to version 10.
        
        if (target[0] === (base[0] + 1) || target[0] === base[0]) {
            return item;
        }
    });
    
    let result = { base: updatedBase, target: filteredTarget };
    
    return result;
}