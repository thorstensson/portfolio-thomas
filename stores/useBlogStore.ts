import { defineStore } from 'pinia'

export const useBlogStore = defineStore('blog', {
  // 1. Move state inside the function (SSR Safe)
  state: () => ({
    data: null as any,
    error: null as Error | string | null,
  }),

  actions: {
    // 2. Regular function (ensures 'this' works)
    async fetchData() {
      try {
        /* Query lives server-side in server/api/blog.get.ts */
        const response = (await $fetch('/api/blog')) as any

        // 3. Assign directly to 'this'
        this.data = response.data
        this.error = response.errors || null

        if (response.errors) {
          console.log('store error:', response.errors)
        }
      } catch (error: unknown) {
        // 4. Type-safe error handling for 2025
        this.error = error instanceof Error ? error.message : String(error)
        console.log('fetch error:', error)
      }
    },
  },
})
