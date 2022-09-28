export const printItem = (name, size, isFolder = false, level = 0, path) => `<div style="margin-left:${ 15 * level }px"  title="${ path ? path : '' }">
<span>${ isFolder ? '📁' : '📄' }</span>&nbsp;
<strong>${ name }</strong>&nbsp;
<em>${ size ? (size / 1_000_000).toFixed(2) + 'MB' : '' }</em></p>
</div>`;
