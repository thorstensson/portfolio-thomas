/**
 * Mux Player is a web component: <mux-player> renders nothing at all until its
 * custom element is defined. Loading it from a page's onMounted means the chunk
 * only starts downloading once that page is already entering — so the venice
 * blinds are opening against a box that has not even upgraded yet, let alone
 * buffered a frame.
 *
 * Firing the import here, at app start and unawaited, takes the element
 * definition off the navigation critical path entirely. Pages wait on
 * customElements.whenDefined('mux-player'), which resolves in a microtask
 * once this has landed.
 */
export default defineNuxtPlugin(() => {
  if (import.meta.server) return

  /* Deliberately not awaited: this should never hold up hydration */
  import('@mux/mux-player')
})
