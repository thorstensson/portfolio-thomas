/**
 * Folio content from Hygraph: about, intro, projects, contact, awards.
 *
 * The query lives here, on the server only: it never reaches the browser
 * bundle, and callers cannot send a query of their own. This route only
 * ever runs this one query.
 *
 * Cached in Nitro memory for 60s:
 * - getKey is fixed, so `/api/folio?anything` shares the same cache entry
 *   instead of creating a new one (and a new Hygraph call) per query string.
 * - swr is false because the Netlify runtime gives Nitro no platform
 *   waitUntil, so a background refresh is not guaranteed to finish. An
 *   expired entry waits for fresh data instead.
 * - Errors are thrown, never returned, so a failed response is never cached.
 */
const FOLIO_QUERY = `
  query folio {
    about(where: { slug: "thomas-thorstensson" }) {
      name
      bioTitle
      bio
      aboutHeroTitle
      aboutHeroDesc
      aboutTitle
      aboutDesc
      jobTitle
      job
      timelineItem
      codeTitle
      codeOneTitle
      codeOneDesc
      codeTwoTitle
      codeTwoDesc
      codeThreeTitle
      codeThreeDesc
      picture { id }
    }
    intro(where: { slug: "intros" }) {
      heroIntroTitle
      heroIntroDesc
      aboutIntroTitle
      aboutIntroDesc
      projIntroTitle
      projIntroDesc
      knowIntroTitle
      knowIntroDesc
      knowOneTitle
      knowOneDesc
      knowTwoTitle
      knowTwoDesc
      knowThreeTitle
      knowThreeDesc
      metaIntroTitle
      metaIntroDesc
      metaTechTitle
      metaTechDesc
      metaCreativeTitle
      metaCreativeDesc
      metaIdeTitle
      metaIdeDesc
      metaPublishTitle
      metaPublishDesc
      metaRepoTitle
      metaRepoUrl
      blogTitle
      blogDesc
      blogExcerptsTitle
      blogExcerptsDesc
      blogExcerptsQuote
    }
    projects {
      name
      client
      endclient
      date
      duration
      type
      demo
      description
      id
      sourceCode
      slug
      tags
      synop
      testimonialName
      testimonialAgency
      testimonialText
      labUrl
      video
      image { id handle fileName }
      coverImage { id handle fileName }
      clientHistory
      selectedproj
      projlab
    }
    contact(where: { slug: "contact" }) {
      id
      viewHeroTitle
      viewHeroCta
      emailTitle
      email
      address
      addressTitle
    }
    awards {
      awardTitle
      awardDesc
      awardLinks
      awardSvg {
        id
        handle
        fileName
        url
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
        body: JSON.stringify({ query: FOLIO_QUERY }),
      })
    } catch (error) {
      console.error('[api/folio] Hygraph request failed:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'GraphQL request failed',
      })
    }

    if (response.errors) {
      console.error('[api/folio] Hygraph returned errors:', response.errors)
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
    getKey: () => 'folio',
  }
)
