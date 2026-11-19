import { defineStore } from 'pinia'

export const useFolioStore = defineStore('folio', {
  state: () => ({
    data: null as any,
    error: null as Error | string | null, // Explicitly allows errors or null
  }),

  actions: {
    clearCache() {
      this.data = null
      this.error = null
    },

    async fetchData() {
      try {
        /* Query lives server-side in server/api/folio.get.ts */
        const response = (await $fetch('/api/folio')) as any

        // IMPORTANT FIXES BELOW:
        this.data = response.data
        this.error = response.errors || null

        if (response.errors) {
          console.log('store error:', response.errors)
        }
      } catch (error: unknown) {
        // IMPORTANT FIX BELOW:
        this.error = error instanceof Error ? error.message : String(error)
        console.log('fetch error:', error)
      }
    },
  },
})
