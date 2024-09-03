<script>
	import { sourceTag, selectVersion, getDiff } from '$lib';

	const repository = 'laravel/laravel';
	/**
	 * @type {any[]}
	 */
	let source = [];
    /**
	 * @type {any[]}
	 */
    let target = [];
    let sourceVersion = sourceTag;
    /**
     * @type {string}
     */
    let targetVersion = '';
    
    ({source, target} = selectVersion(sourceVersion));
    targetVersion = target[0];

    /**
	 * @param {{ target: { value: string; }; }} event
	 */
    function updateSelectVersion(event) {
        // Update the sourceVersion to match with selected value.
        sourceVersion = event.target.value;
        
        ({ source, target } = selectVersion(sourceVersion));
    }

	let diff = getDiff(sourceVersion, targetVersion, repository);
    
    function submit() {
        diff = getDiff(sourceVersion, targetVersion, repository);
    }
</script>

<h1>Laravel Diff</h1>
<p>Compare between source and target version of Laravel framework. Think about Laravel Shift but in manual way. 😁</p>

<form on:submit|preventDefault={submit}>
<label for="source">Source</label>
<select bind:value={sourceVersion} id="source" on:change={updateSelectVersion}>
    {#each source as item}
        <option value={item}>{item}</option>
    {/each}
</select>

<label for="target">Target</label>
<select bind:value={targetVersion} id="target">
    {#each target as item}
        <option value={item}>{item}</option>
    {/each}
</select>

<button type="submit">Submit</button>
</form>

{#await diff}
	<p>Get diff between {sourceVersion} and {targetVersion}...</p>
{:then result}
    <p>Showing {result.length} changed files.</p>
	{#each result as item}
		<div class="file" id="diff-{item.sha}">
			<div class="meta">
				<span><a href="#diff={item.sha}">{item.filename}</a></span>
				<span class="links"> </span>
			</div>
			<table class="diff">
				<tbody>
					{#each item.lines as line}
						<tr>
							<td class="line-num {line.status}" data-line-number="{line.number}"></td>
							<td class="line-num {line.status}" data-line-number="{line.number}"></td>
							<td class="line-code {line.status}">
								{line.text}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/each}
{:catch error}
    <p>{error.message}</p>
{/await}

<style>
	.file {
		border: 1px solid #ddd;
		border-radius: 4px;
		margin-bottom: 2em;
	}

	.meta {
		background-color: #f7f7f7;
		border-bottom: 1px solid #d8d8d8;
		border-top-left-radius: 4px;
		border-top-right-radius: 4px;
		padding: 5px 10px;
	}

	.meta .file-anchor {
		color: inherit;
		text-decoration: none;
	}

	.meta .file-anchor:hover {
		text-decoration: underline;
	}

	.meta .links {
		float: right;
		font-size: 80%;
	}

	.meta .source {
		color: #c88;
	}

	.meta .target {
		color: #8c8;
	}

	.diff {
		border-bottom-left-radius: 4px;
		border-bottom-right-radius: 4px;
		border-collapse: separate;
		border-spacing: 0;
		display: block;
		font-family: Consolas, Monaco, 'Andale Mono', monospace;
		overflow-x: auto;
	}

	.line-num {
		border: solid #eee;
		border-width: 0 1px 0 0;
		color: rgb(0 0 0 / 30%);
		min-width: 40px;
		padding-right: 0.4em;
		text-align: right;
		width: 1%;
	}

	.line-num::before {
		content: attr(data-line-number);
	}

	.line-num.comment {
		background-color: #fafafa;
	}

	.line-num.remove {
		background-color: #fdd;
		border-color: #f1c0c0;
	}

	.line-num.add {
		background-color: #dbffdb;
		border-color: #c1e9c1;
	}

	.line-code {
		color: #333;
		padding: 0 1em;
		text-indent: -7px;
		white-space: pre-wrap;
	}

	.line-code.comment {
		background-color: #fafafa;
		color: rgb(0 0 0 / 30%);
	}

	.line-code.remove {
		background-color: #ffecec;
	}

	.line-code.add {
		background-color: #eaffea;
	}
</style>
