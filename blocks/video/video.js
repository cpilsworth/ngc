/*
 * Video Block
 * Show a video referenced by a link
 * https://www.hlx.live/developer/block-collection/video
 */

export default async function decorate(block) {
  const a = block.querySelector("a");
  const img = block.querySelector("img");
  const poster = img ? `poster="${img.src}"` : "";

  if (a) {
    const source = a.href;
    block.innerHTML = `
    <video muted autoplay loop playsinline class="lazy">
      <source data-src="${source}" type="video/${
      source.split(".").pop()
    }" ${poster}>
      <track default src="/scripts/captions.vtt" kind="captions" srclang="en" label="captions" hidden>
    </video>
    `;
  }
  // lazy load videos
  var lazyVideos = [].slice.call(document.querySelectorAll("video.lazy"));
  if ("IntersectionObserver" in window) {
    var lazyVideoObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (video) {
          if (video.isIntersecting) {
            for (var source in video.target.children) {
              var videoSource = video.target.children[source];
              if (
                typeof videoSource.tagName === "string" &&
                videoSource.tagName === "SOURCE"
              ) {
                videoSource.src = videoSource.dataset.src;
              }
            }
            video.target.load();
            video.target.classList.remove("lazy");
            lazyVideoObserver.unobserve(video.target);
          }
        });
      },
    );

    lazyVideos.forEach(function (lazyVideo) {
      lazyVideoObserver.observe(lazyVideo);
    });
  }
}
