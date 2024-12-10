/** @type {import('./$types').PageLoad} */
export async function load({ fetch, params }) {
    const tagsResponse = await fetch('/api/tags');
    const tags = await tagsResponse.json();
    const diffResponse = await fetch(`/api/diff?base=${tags[1]}&target=${tags[0]}`);
    const diff = await diffResponse.json();
    
    return {
        tags,
        diff
    }
}