<script setup lang="ts">
  import { ExpoScaleEase } from 'gsap/all'
  import { useFolioStore } from '../stores/useFolioStore'
  import { useBlogStore } from '../stores/useBlogStore'

  const route = useRoute()

  /* Pinia 🍍 */
  const store = useFolioStore()
  const blogStore = useBlogStore()

  /* Parallell */
  await Promise.all([
    callOnce('projects', () => store.fetchData()),
    callOnce('blog', () => blogStore.fetchData()),
  ])

  const isLoaded = ref(false)
  const showIntroAnimation = ref(false)
  const percNum = ref(0)
  const { $gsap } = useNuxtApp()
  const circle = ref(null)
  const percText = ref(null)

  let cachedBlinds: any[] = []
  const topLine = ref<SVGLineElement | null>(null)
  const bottomLine = ref<SVGLineElement | null>(null)
  const loadingText = ref<SVGTextElement | null>(null)

  /*
    The blinds live in CommonVenice.vue as markup and styles only. All control stays here and
    in middleware/page.global.ts, targeting the classes directly, so nothing waits on component
    props or mounting.

    TODO: Writeup about how middleware can be used to enhance page transitions in Nuxt.
    */

  onMounted(() => {
    $gsap.registerPlugin(ExpoScaleEase)
    isLoaded.value = true
    cachedBlinds = $gsap.utils.toArray('.venice__blind')
    $gsap.set(cachedBlinds, { scaleX: 0 })

    // SVG elements are now available via template refs
    // No need for querySelector

    /* Show intro animation on homepage */
    const isHomepage = route.path === '/'
    const tl = $gsap.timeline()

    if (isHomepage) {
      showIntroAnimation.value = true

      // Set initial state for SVG lines (completely hidden)
      if (topLine.value && bottomLine.value) {
        topLine.value.style.strokeDasharray = '0 250'
        bottomLine.value.style.strokeDasharray = '0 250'
      }
      if (loadingText.value) {
        loadingText.value.style.opacity = '0'
      }

      // Animate the preloader
      tl.set('.preloader', { autoAlpha: 1 })
        .add(createRandomDashAnimation(), 0)
        .to(
          percNum,
          {
            value: 100,
            duration: 2.5,
            ease: 'cubic-bezier(0.33, 1, 0.68, 1)',
            onUpdate: function () {
              updateDashPattern(this.progress())
            },
          },
          0
        )
        .to('.preloader', {
          autoAlpha: 0,
          duration: 0.5,
          ease: 'power2.out',
        })
        .fromTo(
          cachedBlinds,
          {
            scaleX: 1,
            opacity: 1,
            transformOrigin: 'left center',
          },
          {
            duration: 1,
            scaleX: 0,
            opacity: 0,
            stagger: 0.05,
            onComplete: clearProps,
          }
        )
    } else {
      /* Hide intro elements immediately if not showing animation */
      tl.fromTo(
        cachedBlinds,
        {
          scaleX: 1,
          opacity: 1,
          transformOrigin: 'left center',
        },
        {
          duration: 1,
          scaleX: 0,
          opacity: 0,
          stagger: 0.05,
          onComplete: clearProps,
        }
      )
    }
  })

  const clearProps = () => {
    $gsap.set(cachedBlinds, {
      clearProps: 'transform,opacity',
    })
    $gsap.set('.venice', { visibility: 'hidden', opacity: 0 })
  }

  /**
   * Create random dash pattern animation for SVG lines
   */
  const createRandomDashAnimation = () => {
    const tl = $gsap.timeline()

    // Animate text opacity
    if (loadingText.value) {
      tl.to(
        loadingText.value,
        {
          opacity: 1,
          duration: 0.5,
          ease: 'power2.out',
        },
        0.2
      ).to(
        loadingText.value,
        {
          opacity: 0,
          duration: 0.3,
          ease: 'power2.in',
        },
        2.2
      )
    }

    return tl
  }

  /**
   * Update dash pattern based on loading progress
   */
  const updateDashPattern = (progress: number) => {
    if (!topLine.value || !bottomLine.value) return

    // Calculate how many segments should be visible based on progress
    const totalSegments = 24 // Increased to account for removed segments
    const visibleSegments = Math.floor(progress * totalSegments)

    // Create random dash pattern
    let dashArray = ''
    const segmentLength = 250 / totalSegments

    for (let i = 0; i < totalSegments; i++) {
      // Skip first 2 and last 2 segments (remove 2 dashes on each side)
      const isFirstTwo = i < 2
      const isLastTwo = i >= totalSegments - 2

      if (isFirstTwo || isLastTwo) {
        // Always gap for removed segments
        dashArray += `0 ${segmentLength} `
      } else if (i - 2 < visibleSegments) {
        // Adjust index for removed segments
        // Randomly decide if this segment should be visible or not
        const shouldShow = Math.random() < 0.7 || i === totalSegments - 3

        if (shouldShow) {
          // Show segment (dash)
          dashArray += `${segmentLength * 0.8} ${segmentLength * 0.2} `
        } else {
          // Hide segment (gap)
          dashArray += `0 ${segmentLength} `
        }
      } else {
        // Not reached yet - all gap
        dashArray += `0 ${segmentLength} `
      }
    }

    // Apply to both lines with slight variation
    topLine.value.style.strokeDasharray = dashArray.trim()

    // Bottom line gets slightly different pattern for organic feel
    const bottomDashArray = dashArray
      .split(' ')
      .map((val, index) => {
        if (index % 2 === 0) {
          // dash values
          return Math.random() > 0.3 ? val : `${parseFloat(val) * 0.7}`
        }
        return val
      })
      .join(' ')

    bottomLine.value.style.strokeDasharray = bottomDashArray
  }
</script>

<template>
  <CommonVenice />
  <div class="preloader" :class="{ 'is-visible': showIntroAnimation }">
    <svg class="preloader__svg" viewBox="0 0 800 100">
      <!-- Top line -->
      <line
        class="preloader__line preloader__line--top"
        ref="topLine"
        x1="150"
        y1="20"
        x2="650"
        y2="20"
        stroke="currentColor"
        stroke-width="1"
        stroke-linecap="round"
      />

      <!-- Centered text -->
      <text
        class="preloader__text"
        ref="loadingText"
        x="400"
        y="54"
        text-anchor="middle"
        dominant-baseline="middle"
        fill="currentColor"
        font-family="'Instrument Sans', -apple-system, BlinkMacSystemFont, sans-serif"
        font-size="12"
        letter-spacing="2"
      >
        LOADING V2
      </text>

      <!-- Bottom line -->
      <line
        class="preloader__line preloader__line--bottom"
        ref="bottomLine"
        x1="150"
        y1="80"
        x2="650"
        y2="80"
        stroke="currentColor"
        stroke-width="1"
        stroke-linecap="round"
      />
    </svg>
  </div>
  <a href="#main-content" class="skip-link">Skip to content</a>
  <UINavBar />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style lang="scss">
  html,
  body {
    margin: 0;
    padding: 0;

    // 1. CRITICAL: Remove fixed height.
    // Lenis needs "height: auto" to calculate the full page length.
    height: auto;
    min-height: 100%;

    // 2. STABILIZATION: Prevent iOS bounce/jitter at boundaries
    overscroll-behavior-y: none;

    // 3. CLEANUP: Standardize behavior
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: $primary;
    font-family: $sans-text;
  }

  body {
    height: 100%;
    background-color: transparent;
    transition: background-color 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  /* Skip-to-content link — visually hidden until focused */
  .skip-link {
    position: absolute;
    top: -100%;
    left: 0;
    z-index: 10001;
    padding: 8px 16px;
    background: $primary;
    color: $secondary;
    font-family: $sans-text;
    font-size: 14px;
    text-decoration: none;

    &:focus {
      top: 0;
    }
  }

  * {
    box-sizing: border-box;
  }

  /*SVG intro*/
  .preloader {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    height: 100dvh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: $primary;
    z-index: 10000;
    opacity: 0;
    visibility: hidden;
    transition:
      opacity 0.3s,
      visibility 0.3s;
    pointer-events: none;

    &.is-visible {
      opacity: 1;
      visibility: visible;
    }

    &__svg {
      width: 80%;
      max-width: 400px;
      height: 100px;
      color: $secondary;
    }

    &__line {
      stroke-dasharray: 0 250; /* Start with no visible line (all gap) */
      stroke-dashoffset: 0;
    }

    &__text {
      opacity: 0;
    }
  }

  /* Modern scrollbar for WebKit (Chrome, Safari, newer Edge) */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(
      44,
      42,
      56,
      0.4
    ); /* accent1 with 40% opacity (increased from 30%) */
    border-radius: 4px;
    transition: background 0.2s ease;

    &:hover {
      background: rgba(44, 42, 56, 0.5); /* accent1 with 50% opacity on hover */
    }
  }

  /* For Firefox */
  * {
    scrollbar-width: thin;
    scrollbar-color: rgba(44, 42, 56, 0.4) transparent; /* accent1 with 40% opacity (increased from 30%) */
  }

  /* Dark mode specific styles */
  .dark-mode {
    &::-webkit-scrollbar-thumb {
      background: rgba(
        190,
        193,
        198,
        0.4
      ); /* accent2 with 40% opacity (increased from 30%) */

      &:hover {
        background: rgba(
          190,
          193,
          198,
          0.5
        ); /* accent2 with 50% opacity on hover */
      }
    }

    * {
      scrollbar-color: rgba(190, 193, 198, 0.4) transparent; /* accent2 with 40% opacity (increased from 30%) */
    }
  }

  .preloader {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    height: 100dvh;
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: $primary;
    pointer-events: none;
    opacity: 0;
    visibility: hidden;
    transition:
      opacity 0.3s,
      visibility 0.3s;

    &.is-visible {
      opacity: 1;
      visibility: visible;
    }

    &__container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2rem;
      width: 80%;
      max-width: 800px;
    }

    &__line {
      display: flex;
      width: 100%;
      height: 2px;
      gap: 2px;

      &--top {
        margin-bottom: 1rem;
      }

      &--bottom {
        margin-top: 1rem;
      }
    }

    &__segment {
      flex: 1;
      height: 100%;
      background-color: transparent;
      border-radius: 1px;
      transition: background-color 0.3s ease;

      &.filled {
        background-color: $secondary;
      }
    }

    &__text {
      font-family: $sans-text;
      font-size: 1.5rem;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: $secondary;
      opacity: 0;
      transition: opacity 0.5s ease;
    }
  }
</style>
