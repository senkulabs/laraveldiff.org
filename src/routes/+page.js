/** @type {import('./$types').PageLoad} */
export async function load({ fetch, url }) {
    const baseParam = url.searchParams.get('base') || '';
    const targetParam = url.searchParams.get('target') || '';
    const tagsResponse = await fetch('/api/tags');
    const tags = await tagsResponse.json();
    let base = tags[1];
    if (tags.includes(baseParam)) {
        base = baseParam;
    }
    let target = tags[0];
    if (tags.includes(targetParam)) {
        target = targetParam;
    }
    
    return {
        base,
        target,
        tags,
        diff: fetch(`/api/diff?base=${base}&target=${target}`)
            .then(res => res.ok ? res.json() : res.text().then(text => { throw new Error (text) }))
            .catch(error => error.message)
    }
}