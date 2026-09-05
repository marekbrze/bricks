/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Unsplash Access Key baked in at build time (optional). Without it, the
   * Vision board's photo search asks the Owner for a key and stores it in
   * their browser instead — see src/modules/vision/lib/unsplash-config.ts.
   */
  readonly VITE_UNSPLASH_ACCESS_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
