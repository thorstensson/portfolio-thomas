/**
 * Blog posts from Hygraph.
 *
 * The query lives here, on the server only: it never reaches the browser
 * bundle, and callers cannot send a query of their own. This route only
 * ever runs this one query.
 *
 * Cached in Nitro memory for 60s:
 * - getKey is fixed, so `/api/blog?anything` shares the same cache entry
 *   instead of creating a new one (and a new Hygraph call) per query string.
 * - swr is false because the Netlify runtime gives Nitro no platform
 *   waitUntil, so a background refresh is not guaranteed to finish. An
 *   expired entry waits for fresh data instead.
 * - Errors are thrown, never returned, so a failed response is never cached.
 */
const BLOG_QUERY = `
  query blog {
    posts {
      content
      slug
      title
      subject
      date
      length
      tags
      authors {
        name
      }
      coverImage {
        id
        handle
        fileName
      }
    }
  }
`

export default defineCachedEventHandler(
  async () => {
    const config = useRuntimeConfig()

    if (!config.gqlHost) {
      throw createError({
        statusCode: 500,
        statusMessage: 'GraphQL host not configured',
      })
    }

    let response: { data?: unknown; errors?: unknown }

    try {
      response = await $fetch(config.gqlHost as string, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: BLOG_QUERY }),
      })
    } catch (error) {
      console.error('[api/blog] Hygraph request failed:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'GraphQL request failed',
      })
    }

    if (response.errors) {
      console.error('[api/blog] Hygraph returned errors:', response.errors)
      throw createError({
        statusCode: 500,
        statusMessage: 'GraphQL returned errors',
      })
    }

    return { data: response.data }
  },
  {
    maxAge: 60,
    swr: false,
    getKey: () => 'blog',
  }
)
