/*
 * Video Block
 * Show a video referenced by a link
 * https://www.hlx.live/developer/block-collection/video
 */

export default async function decorate(block) {
  const a = block.querySelector('a');
  if (a) {
    const source = a.href;
    block.innerHTML = `
    <video muted autoplay>
      <source src="${source}" type="video/${source.split('.').pop()}" >
    </video>
    `;
  }
}
