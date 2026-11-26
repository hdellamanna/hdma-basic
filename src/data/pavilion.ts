export const pavilionSrcset = [480, 768, 1152]
  .map((width) => `/images/floor/pavilion-${width}.avif ${width}w`)
  .join(', ')

// The picture spans the page on mobile and one column of a 90rem grid on desktop.
export const pavilionSizes =
  '(max-width: 760px) calc(100vw - max(2rem, 8vw)), min(52vw, 46.5rem)'

export function preloadPavilion() {
  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'image'
  link.type = 'image/avif'
  link.imageSrcset = pavilionSrcset
  link.imageSizes = pavilionSizes
  link.fetchPriority = 'high'
  document.head.append(link)
}
