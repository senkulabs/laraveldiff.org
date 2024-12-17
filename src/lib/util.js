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

        // NOTE: For special cases upgrade.
        // 4.0 to 4.2
        // 4.2 to 5.0
        // 5.0 to 5.1.x
        // 5.1 to 5.2
        // 5.2 to 5.3
        // 5.3 to 5.4
        // 5.4 to 5.5
        // 5.5 to 5.6
        // 5.6 to 5.7
        // 5.7 to 5.8
        // 5.8 to 6.0
        switch (base[0]) {
            case 4:
                if (base[1] === 2) {
                    return item.startsWith('v5.0');
                } else if (base[1] === 1) {
                    return item.startsWith('v4.2');
                } else {
                    return item.startsWith('v4.1');
                }
            case 5:
                switch (base[1]) {
                    case 0:
                        return item.startsWith('v5.1');
                    case 1:
                        return item.startsWith('v5.2');
                    case 2:
                        return item.startsWith('v5.3');
                    case 3:
                        return item.startsWith('v5.4');
                    case 4:
                        return item.startsWith('v5.5');
                    case 5:
                        return item.startsWith('v5.6');
                    case 6:
                        return item.startsWith('v5.7');
                    case 7:
                        return item.startsWith('v5.8');
                }
            default:
                // NOTE: We only allowed one version above the base version for incremental upgrade.
                // This is intended for make upgrade process easier
                // E.g. if the base version is 9 then it only allowed up to version 10.
                if (target[0] === (base[0] + 1) || target[0] === base[0]) {
                    return item;
                }
                break;
        }
    });
    
    let result = { base: updatedBase, target: filteredTarget };
    
    return result;
}

/**
 * @param {string} diffString
 */
export function parsedLines(diffString) {
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

/**
 * @param {string} diffString
 */
export function parseRawLines(diffString) {
	const lines = diffString.split('\n');

    const parsedLines = lines.map((/** @type {string} */ line, /** @type {number} */ index) => {
        return {
            number: index + 1,
            text: line
        }
    });

    return parsedLines;
}