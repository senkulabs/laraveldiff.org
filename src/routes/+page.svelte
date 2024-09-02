<script>
	import { allTags, mapPatch } from '$lib';

	const repository = 'laravel/laravel';
	const sourceVersion = '11.1.3';
	const targetVersion = '11.1.4';

	const tags = allTags(repository);
	const patch = mapPatch(sourceVersion, targetVersion, repository);
</script>

<h1>Laravel Diff</h1>
<p>Compare between source and target version of Laravel framework. Think about Laravel Shift but in manual way. 😁</p>

{#await tags}
	<select>
        <option value="" disabled>Select source version</option>
    </select>
{:then result}
	<select>
		{#each result as item}
			<option value={item}>{item}</option>
		{/each}
	</select>
{/await}

{#await patch}
	<p>Waiting patch result from version {sourceVersion} to {targetVersion}....</p>
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
