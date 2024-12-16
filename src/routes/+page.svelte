<script>
	import { parseRawLines, selectVersion } from '$lib/util';
	
	let { data } = $props();
	let tags = data.tags;
	let diff = $state(data.diff);

	let baseVersion = $state(tags[1]);
	let targetVersion = $state(tags[0]);

	let base = $state(selectVersion(tags[1], tags).base);
	let target = $state(selectVersion(tags[1], tags).target);
	let additionalTitle = $state(`${tags[1]} - ${tags[0]}`);

	let toggleCollapse = $state(false);
	let listHeight = $state(0);
	/**
	 * @type {HTMLOListElement}
	 */
	// svelte-ignore non_reactive_update
	let list;

	let highlighted = $state('');
	/**
	 * @type {{ [key: string]: number }}
	 */
	 let diffContentHeights = $state({});

	/**
	 * @type {{ [key: string]: string }}
	 */
	let activeViews = $state({}); // Tracks active view for each block

	/**
	 * @type {{ [key: string]: string }}
	 */
	 let contentTarget = $state({});

	/**
	 * @param {{ target: { value: any; }; }} event
	 */
	function changeSelectVersion(event) {
		baseVersion = event.target.value;
		base = selectVersion(baseVersion, tags).base;
		target = selectVersion(baseVersion, tags).target;
		targetVersion = target[0];
	}

	/**
	 * @param {{ preventDefault: () => void; }} event
	 */
	function submit(event) {
		event.preventDefault();
		// Reset toggle collapse to false if the the list was collapsed.
		toggleCollapse = false;
		// Reset activeViews & contentTarget
		activeViews = {};
		contentTarget = {};
		diff = fetch(`/api/diff?base=${baseVersion}&target=${targetVersion}`)
			.then(response => response.json());
		additionalTitle = `${baseVersion} - ${targetVersion}`;
	}

	function handleToggleCollapse() {
		toggleCollapse = !toggleCollapse;
		// Keep update listHeight value each time we update base and target
		if (list) {
			const clone = list.cloneNode(true);
			clone.style.position = 'absolute';
			clone.style.visibility = 'hidden';
			clone.style.height = 'auto';
			document.body.appendChild(clone);
			listHeight = clone.offsetHeight;
			document.body.removeChild(clone);
		}
	}

	function handleHighlightTarget(value) {
		highlighted = `#diff-${value}`;	
	}

	$effect(() => {
		window.addEventListener('popstate', function () {
			if (window.location.hash !== '') {
				highlighted = window.location.hash;
				// Get element without the # symbol
				const elementId = window.location.hash.substring(1);
				const element = document.getElementById(elementId);
				if (element) {
					element.scrollIntoView({ behavior: 'smooth', block: 'start' });
				}
			}
		});
	});

	/**
	 * @param {string | number} id
	 * @param {string} view
	 */
	function handleActiveViews(id, view) {
		// Create a new object instead of mutating the existing one
		activeViews = { ...activeViews, [id]: view };
	}

	/**
	 * @param {any} id
	 * @param {string} raw_url
	 */
	function handleContentTarget(id, raw_url) {
		const content = fetch(`api/content?raw_url=${raw_url}`)
			.then(response => response.text());
		contentTarget = { ...contentTarget, [id]: content }
	}

	/**
	 * @param {Promise<{status: 'fulfilled', result: string}>} result
	 */
	async function handleCopyContent(result) {
		let response = await result;
		await navigator.clipboard.writeText(response);
	}
</script>

<svelte:head>
	<title>Laravel Diff {additionalTitle}</title>
	<meta name="title" content="Laravel Diff">
	<meta name="description" content="A utility to compare what files changed when upgrade your Laravel framework.">
	<meta name="og:type" content="website">
	<meta name="og:title" content="Laravel Diff">
	<meta name="og:description" content="A utility to compare what files changed when upgrade your Laravel framework.">
	<meta name="twitter:card" content="summary">
	<meta name="twitter:title" content="Laravel Diff">
	<meta name="twitter:description" content="A utility to compare what files changed when upgrade your Laravel framework.">
</svelte:head>

<div class="container">
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
		<p>Showing <button onclick={handleToggleCollapse}>{result.length} changed {result.length > 1 ? 'files' : 'file'}</button>.</p>
		<ol bind:this={list} style:height={toggleCollapse ? `${listHeight}px` : '0px'} class:open={toggleCollapse} class="collapse" style="list-style-type: none; margin: 0; margin-bottom: 1rem; padding: 0;">
			{#each result as item}
				<li><a href="#diff-{item.sha}" onclick={() => handleHighlightTarget(item.sha)}>{item.filename}</a></li>
			{/each}
		</ol>
		{#each result as item}
			<div class="file" class:highlight={highlighted === `#diff-${item.sha}`} id="diff-{item.sha}">
				<div class="meta">
					<span><a class="file-anchor" onclick={() => handleHighlightTarget(item.sha)} href="#diff-{item.sha}">{item.filename}</a></span>
					<span class="links">
						<a target="_blank" class="base" href={item.base_url}>{baseVersion}</a>
						...
						<a target="_blank" class="target" href={item.target_url}>{targetVersion}</a>
					</span>
				</div>
				<div class="meta">
					<ul style="display: flex; justify-content: flex-end; list-style-type: none; gap: .5rem; padding; 0; margin: 0;">
						<li><button class:active={!activeViews[item.sha] || activeViews[item.sha] === 'Diff'} onclick={() => handleActiveViews(item.sha, 'Diff') }>Diff</button></li>
						<li><button class:active={activeViews[item.sha] === 'Target'} onclick={() => handleActiveViews(item.sha, 'Target') }>Target</button></li>
					</ul>
				</div>
				{#if contentTarget[item.sha]}
				<div class="meta" style="display: flex; justify-content: flex-end;">
					<button onclick={() => handleCopyContent(contentTarget[item.sha])}>copy</button>
				</div>
				{/if}
				<table>
					{#if !activeViews[item.sha] || activeViews[item.sha] === 'Diff'}
					<tbody bind:clientHeight={diffContentHeights[item.sha]}>
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
					{/if}
					{#if activeViews[item.sha] === 'Target'}
					<tbody style="height: {diffContentHeights[item.sha]}px;">
						{#if !contentTarget[item.sha]}
							<tr>
								<td>&nbsp;</td>
								<td style="text-align: center;">
									<button onclick={() => handleContentTarget(item.sha, item.raw_url)}>Show content</button>
								</td>
							</tr>
						{:else}
							{#await contentTarget[item.sha]}
								<tr>
									<td>&nbsp;</td>
									<td>Showing content...</td>
								</tr>
							{:then result}
								{@const lines = parseRawLines(result)}
								{#each lines as line}
									<tr>
										<td class="line-num" data-line-number={line.number}></td>
										<td class="line-code">
											<span class="line-code-inner">
												<span>{line.text}</span>
											</span>
										</td>
									</tr>
								{/each}
							{:catch error}
								<tr>
									<td>&nsbp;</td>
									<td>{error.message}</td>
								</tr>
							{/await}
						{/if}
					</tbody>
					{/if}
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
		margin: 0 auto;
		padding: .5rem 1rem;
	}

	/* Large screen */
	@media screen and (min-width: 1024px) {
		.container {
			width: 960px;
		}
	}

	.collapse {
		position: relative;
		overflow: hidden;
		transition: height .35s ease-in-out;
	}

	li:not(:last-child) {
		margin-bottom: 1rem;
	}

	.file {
		border: 1px solid #ddd;
		border-radius: 4px;
		margin-bottom: 2rem;
	}

	.highlight {
		border: 2px solid #007bff;
	}

	.meta {
		background-color: #f7f7f7;
		border-bottom: 1px solid #d8d8d8;
		border-top-left-radius: 4px;
		border-top-right-radius: 4px;
		padding: 5px 10px;
		/* hide overflow text */
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
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

	table {
		border-bottom-left-radius: 4px;
		border-bottom-right-radius: 4px;
		border-collapse: separate;
		border-spacing: 0;
		display: block;
		font-family: Consolas, Monaco, 'Andale Mono', monospace;
		overflow-x: auto;
	}

	tbody {
		display: block; /** This is important for the height to work */
	}

	tr {
		display: table; /** Keep the table row layout */
		width: 100%;
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
