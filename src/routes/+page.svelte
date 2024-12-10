<script>
	import { selectVersion } from '$lib/util';
	
	let { data } = $props();
	let tags = data.tags;
	let diff = $state(data.diff);

	let baseVersion = $state(tags[1]);
	let targetVersion = $state(tags[0]);

	let base = $state(selectVersion(tags[1], tags).base);
	let target = $state(selectVersion(tags[1], tags).target);

	/**
	 * @param {{ target: { value: any; }; }} event
	 */
	function changeSelectVersion(event) {
		baseVersion = event.target.value;
		base = selectVersion(baseVersion, tags).base;
		target = selectVersion(baseVersion, tags).target;
		targetVersion = target[0];
	}

	let additionalTitle = $state(`${tags[1]} - ${tags[0]}`);

	/**
	 * @param {{ preventDefault: () => void; }} event
	 */
	function submit(event) {
		event.preventDefault();
		diff = fetch(`/api/diff?base=${baseVersion}&target=${targetVersion}`)
			.then(response => response.json());
		additionalTitle = `${baseVersion} - ${targetVersion}`;
	}
</script>

<svelte:head>
	<title>LaravelDiff {additionalTitle}</title>
	<meta name="description" content="A utility to compare what files changed when upgrade your Laravel framework.">
</svelte:head>

<div class="container" style="margin: 0 auto;">
	<h1>Laravel Diff</h1>
	<p>A utility to compare what files changed when upgrade your Laravel framework.</p>
	<p><em>Kind a <a href="https://laravelshift.com" target="_blank" rel="noopener noreferrer">Laravel Shift</a> but tiny and manual.</em></p>
	<p><em>Motivated from <a href="https://github.com/railsdiff/railsdiff" target="_blank" rel="noopener noreferer">railsdiff.org</a></em></p>

	<form onsubmit={submit}>
		<label for="base">Base</label>
		<select bind:value={baseVersion} id="base" onchange={changeSelectVersion}>
			<option value="" disabled>Select base version</option>
			{#each base as item}
				<option value={item}>{item}</option>
			{/each}
		</select>

		<label for="target">Target</label>
		<select bind:value={targetVersion} id="target">
			<option value="" disabled>Select target version</option>
			{#each target as item}
				<option value={item}>{item}</option>
			{/each}
		</select>

		<button type="submit">Submit</button>
	</form>

	{#await diff}
		<p>Get diff between {baseVersion} and {targetVersion}...</p>
	{:then result}
		<p>Showing {result.length} changed files.</p>
		{#each result as item}
			<div class="file" id="diff-{item.sha}">
				<div class="meta">
					<span><a class="file-anchor" href="#diff={item.sha}">{item.filename}</a></span>
					<span class="links">
						<a target="_blank" class="base" href={item.base_url}>{baseVersion}</a>
						...
						<a target="_blank" class="target" href={item.target_url}>{targetVersion}</a>
					</span>
				</div>
				<table class="diff">
					<tbody>
						{#each item.lines as line}
							<tr>
								<td class="line-num {line.status}" data-line-number={line.number}></td>
								<td class="line-code {line.status}">
									<span class="line-code-inner" data-code-marker={line.text.substring(0, 1)}>
										<span>{line.text.substring(1)}</span>
									</span>
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
</div>

<style>
	.container {
		width: 100%;
	}

	/* Large screen */
	@media screen and (min-width: 1024px) {
		.container {
			width: 960px;
		}
	}

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

	.meta .base {
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

	.line-code-inner::before {
		content: attr(data-code-marker);
	}

	.line-code-inner span {
		margin-left: 8px;
	}
</style>
