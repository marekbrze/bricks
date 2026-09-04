import type { VisionTile } from '../types/vision'

/**
 * Merge a Vision's ordered tiles into a single markdown document — notes as
 * paragraphs, images as `![]()` tags with the Unsplash photographer credited
 * as a caption line where the tile carries attribution. See docs/modules/vision.md.
 */
export function buildVisionMarkdown(pathName: string, tiles: VisionTile[]): string {
  const parts = [`# ${pathName} — Vision`, '']
  for (const tile of tiles) {
    if (tile.type === 'note') {
      parts.push(tile.text, '')
    } else {
      parts.push(`![${tile.alt}](${tile.src})`)
      if (tile.attribution) {
        parts.push(`*Photo by [${tile.attribution.photographer}](${tile.attribution.profileUrl}) on Unsplash*`)
      }
      parts.push('')
    }
  }
  return parts.join('\n').trimEnd() + '\n'
}

/** Filesystem-safe slug for the downloaded file name. */
export function visionExportFileName(pathName: string): string {
  const slug =
    pathName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'path'
  return `${slug}-vision.md`
}

/** Build the markdown and trigger a browser download — no preview step (ADR 0016). */
export function downloadVisionMarkdown(pathName: string, tiles: VisionTile[]): void {
  const markdown = buildVisionMarkdown(pathName, tiles)
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = visionExportFileName(pathName)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
