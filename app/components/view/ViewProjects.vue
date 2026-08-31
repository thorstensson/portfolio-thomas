<script setup lang="ts">
  import { ScrollTrigger } from 'gsap/ScrollTrigger'
  import { Draggable } from 'gsap/Draggable'
  import { InertiaPlugin } from 'gsap/InertiaPlugin'
  import { useFolioStore } from '../../../stores/useFolioStore'

  /* PINIA 🍍 */
  const store = useFolioStore()
  const { $gsap } = useNuxtApp()

  const projectsReel = useTemplateRef<HTMLDivElement>('projectsReel')
  const projectItem = ref<HTMLDivElement[]>([])
  const clampedIndex = ref<number>(0)
  const isDragging = ref(false) /* Track dragging state including inertia */

  let ctx: gsap.Context
  let draggableInstance: Draggable[] | null = null

  const dateSorted = computed(() => {
    if (!store.data?.projects) return []

    return [...store.data.projects].sort((a, b) => {
      /* Convert "Month YYYY" format to proper Date objects */
      const parseDate = (dateStr: string) => {
        const [month, year] = dateStr.split(' ')
        /* Create date with month name and year */
        return new Date(`${month} 1, ${year}`)
      }

      /* Sort by date descending (newest first) */
      return parseDate(b.date).getTime() - parseDate(a.date).getTime()
    })
  })

  const activeFilter = ref<'All' | 'Client' | 'Personal'>('All')

  const filteredProjects = computed(() => {
    const all = dateSorted.value
    const key = activeFilter.value.toLowerCase()
    if (key === 'all') return all
    if (key === 'personal') return all.filter((p) => p.labUrl || p.projlab)
    return all.filter((p) => !p.labUrl && !p.projlab)
  })

  const centeredProject = computed(() => {
    return filteredProjects.value[clampedIndex.value]
  })

  const progressIndex = computed(() => {
    const totalProjects = filteredProjects.value.length || 1
    return { current: clampedIndex.value + 1, total: totalProjects }
  })

  const handleProjectClick = (project: any) => {
    if (project.projlab) {
      navigateTo(`/project/${project.slug}`)
    } else if (project.labUrl) {
      window.open(project.labUrl, '_blank')
    } else {
      navigateTo(`/project/${project.slug}`)
    }
  }

  /* Function to setup/update Draggable configuration */
  const setupDraggable = () => {
    const numProjects = filteredProjects.value.length || 0

    if (
      !projectsReel.value ||
      numProjects === 0 ||
      projectItem.value.length === 0
    ) {
      return
    }

    /* Destroy existing draggable instance */
    if (draggableInstance) {
      draggableInstance[0]?.kill()
      draggableInstance = null
    }

    /* Calculate total width of all projects + gaps */
    const projectWidth =
      projectItem.value[1]?.getBoundingClientRect().width || 0
    const gapWidth =
      parseFloat(
        getComputedStyle(projectsReel.value).getPropertyValue('column-gap')
      ) || 0
    const paddingLeft =
      parseFloat(
        getComputedStyle(projectsReel.value).getPropertyValue('padding-left')
      ) || 0
    const totalContentWidth =
      projectWidth * numProjects + gapWidth * (numProjects - 1) + paddingLeft
    const viewportWidth = window.innerWidth

    /* Calculate initial offset to center first project */
    /* Account for the padding-left on the reel which equals the gap width */
    const initialOffset = (viewportWidth - projectWidth) / 2 - gapWidth

    /* Set initial position to center the first project */
    $gsap.set(projectsReel.value, { x: initialOffset })

    /* Calculate how far we can drag (negative because we drag left) */
    /* Add extra padding to ensure last project can be fully centered */
    const maxDragDistance =
      totalContentWidth - viewportWidth + initialOffset + paddingLeft

    /* Extract callback functions to prevent SSR serialization issues */
    const handleDrag = function (this: any) {
      isDragging.value = true
      /* Calculate velocity and direction for skew effect */
      const velocity = InertiaPlugin.getVelocity(this.target, 'x')
      const skewAmount = Math.max(-40, Math.min(40, velocity * 0.01))

      /* Apply skew for positioning and filters for visual effect */
      $gsap.set('.projects__project__image', {
        skewX: skewAmount,
        duration: 0.4,
        filter: 'blur(2px)',
        ease: 'power2.out',
      })

      /* Counter-transform lab icon position during drag */
      const iconOffset =
        skewAmount < 0
          ? Math.abs(skewAmount) * 1.8
          : -Math.abs(skewAmount) * 4.2
      $gsap.set('.projects__lab-indicator', {
        x: iconOffset,
        duration: 0.4,
        ease: 'power2.out',
      })
    }

    const handleDragEnd = function () {
      /* Reset skew and filters when drag ends */
      $gsap.to('.projects__project__image', {
        skewX: 0,
        filter: 'blur(0px)',
        duration: 0.3,
        ease: 'power2.out',
      })

      /* Reset lab icon position */
      $gsap.to('.projects__lab-indicator', {
        x: 0,
        duration: 0.3,
        ease: 'power2.out',
      })
    }

    const handleSnap = (endValue: number) => {
      /* Calculate snap points using fresh measurements to match onThrowComplete */
      const unscaledIndex = clampedIndex.value === 0 ? 1 : 0
      const currentProjectWidth =
        projectItem.value[unscaledIndex]?.getBoundingClientRect().width ||
        projectItem.value[0]?.getBoundingClientRect().width ||
        0
      const currentGapWidth = projectsReel.value
        ? parseFloat(
            getComputedStyle(projectsReel.value).getPropertyValue('column-gap')
          ) || 0
        : 0
      const snapDistance = currentProjectWidth + currentGapWidth
      const snapIndex = Math.round((initialOffset - endValue) / snapDistance)
      return Math.round(initialOffset - snapIndex * snapDistance)
    }

    const handleThrowComplete = function (this: any) {
      isDragging.value = false /* Reset only when inertia completes */
      /* Calculate which project is in the center when inertia stops */
      const currentX = this.x

      /* Recalculate projectWidth fresh to get current actual width */
      /* Use a project that's NOT the centered one to get unscaled width */
      const unscaledIndex = clampedIndex.value === 0 ? 1 : 0
      const currentProjectWidth =
        projectItem.value[unscaledIndex]?.getBoundingClientRect().width ||
        projectItem.value[0]?.getBoundingClientRect().width ||
        0
      const currentGapWidth = projectsReel.value
        ? parseFloat(
            getComputedStyle(projectsReel.value).getPropertyValue('column-gap')
          ) || 0
        : 0
      const snapDistance = currentProjectWidth + currentGapWidth

      /* Distance travelled / snap distance (proj width + gap) = index */
      const centerIndex = Math.round((initialOffset - currentX) / snapDistance)

      /* Ensure index is within bounds */
      clampedIndex.value = Math.max(0, Math.min(centerIndex, numProjects - 1))
    }

    $gsap.context((self) => {
      draggableInstance = Draggable.create('.projects__reel', {
        type: 'x' /* Horizontal dragging */,
        bounds: {
          minX: -maxDragDistance,
          maxX: initialOffset /* Start from centered position, not 0 */,
        },
        inertia: true,
        minDuration: 0.1,
        maxDuration: 1,
        dragResistance: 0.3,
        edgeResistance: 0.5 /* Smooth resistance at bounds */,
        allowEventDefault: false /* Prevent default touch behaviors */,
        force3D: true,
        onDrag: handleDrag,
        onDragEnd: handleDragEnd,
        onThrowComplete: handleThrowComplete,
        snap: {
          x: handleSnap,
        },
      })
    })
  }

  /* Debounced resize handler */
  let resizeTimeout: NodeJS.Timeout
  const handleResize = () => {
    clearTimeout(resizeTimeout)
    resizeTimeout = setTimeout(() => {
      setupDraggable()
    }, 150) /* 150ms debounce */
  }

  onMounted(async () => {
    if (import.meta.client) {
      import('@/pages/project/[id].vue')
    }

    ctx = $gsap.context((self) => {
      $gsap.registerPlugin(ScrollTrigger)
      $gsap.registerPlugin(Draggable, InertiaPlugin)
    })

    /* Simple fade-in animation for projects and progress */
    const tl = $gsap.timeline()
    tl.from('.projects__reel, .progress', {
      duration: 0.8,
      opacity: 0,
      ease: 'power2.inOut',
    })

    /* Initial setup */
    setupDraggable()

    /* Add resize listener */
    window.addEventListener('resize', handleResize)

    watch(activeFilter, () => {
      clampedIndex.value = 0
      nextTick(() => setupDraggable())
    })
  })

  onUnmounted(() => {
    /* Cleanup resize listener */
    window.removeEventListener('resize', handleResize)

    /* Cleanup draggable instance */
    if (draggableInstance) {
      draggableInstance[0]?.kill()
      draggableInstance = null
    }

    /* Clear any pending resize timeout */
    if (resizeTimeout) {
      clearTimeout(resizeTimeout)
    }

    ctx?.revert()
  })
</script>

<template>
  <main ref="main" class="projects-wrapper">
    <!-- Moving light background effect -->
    <div class="projects-background"></div>

    <!--:className here is for gsap-->
    <CommonAbstract
      class="front-header"
      :label="'Projects'"
      :delay="1"
      :desc="''"
      :class-name="'abstract__projects'"
      :is-hero="true"
      heading-level="h1"
      :is-full-width="false"
      :is-secondary="false"
      :author="''"
      :date="''"
      :is-two-lines="false"
      :is-page-header="false"
    />

    <div class="progress">
      <div class="progress__text">
        {{ progressIndex.current }}/{{ progressIndex.total }}
      </div>
    </div>
    <div class="project-filter">
      <button
        v-for="opt in ['All', 'Client', 'Personal'] as const"
        :key="opt"
        :class="{ 'project-filter--active': activeFilter === opt }"
        class="project-filter__btn action"
        data-name="menu"
        @click="activeFilter = opt"
      >
        <span class="project-filter__word">{{ opt }}</span
        ><template v-if="opt !== 'Personal'"> /</template>
      </button>
    </div>
    <Transition name="fade">
      <div class="projects" :key="activeFilter">
        <div class="projects__reel" ref="projectsReel">
          <div v-for="(project, index) in filteredProjects" :key="project.id">
            <div
              class="projects__project"
              ref="projectItem"
              :class="{
                'projects__project--open':
                  index === clampedIndex && !isDragging,
              }"
            >
              <div
                class="projects__project__image-container action"
                data-name="reel"
              >
                <NuxtLink @click="handleProjectClick(project)">
                  <NuxtImg
                    :src="project.coverImage?.handle"
                    provider="hygraph"
                    alt="Project image"
                    format="webp"
                    sizes="sm:100vw"
                    densities="x1 x2"
                    class="projects__project__image"
                  ></NuxtImg>
                </NuxtLink>
                <span
                  v-if="project.labUrl"
                  class="projects__lab-indicator"
                  title="Lab Project"
                >
                  <Icon
                    name="mdi:link-box-variant"
                    class="projects__lab-indicator-svg"
                  />
                </span>
              </div>

              <div class="projects__project__info">
                <div class="projects__project__title">
                  <p class="split-proj-w">
                    {{ project.name }}
                  </p>
                  <p class="split-proj-w">{{ project.date.split(' ')[1] }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </main>
</template>

<style lang="scss" scoped>
  img {
    height: auto;
  }

  a:hover {
    filter: blur(0px);
  }

  p {
    margin: 0;
  }

  .projects-wrapper {
    overscroll-behavior: none;
    position: fixed; /* Crucial for iOS Safari */
    top: 0; /* Ensure it starts at the very top */
    left: 0;
    width: 100%;
    overflow: hidden;
    padding: 0 $px-16-spacer;

    width: 100%;
    height: 100dvh;

    @include this-and-above('lg') {
      padding: 0 $px-64-spacer;
    }
  }

  .projects-background {
    position: absolute;
    top: 0px;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 300%;
      height: 100%;
      background: linear-gradient(
        45deg,
        transparent 0%,
        transparent 40%,
        rgba(255, 255, 255, 0.03) 50%,
        transparent 60%,
        transparent 100%
      );
      animation: moveLight 12s ease-in-out infinite alternate;
      pointer-events: none;
    }

    /* Stronger effect for light theme */
    .light-mode &::before {
      background: linear-gradient(
        45deg,
        transparent 0%,
        transparent 40%,
        #ffffff 50%,
        transparent 60%,
        transparent 100%
      );
    }
  }

  .front-header {
    position: absolute;
    bottom: 0px;
  }

  .project-filter {
    position: absolute;
    z-index: 10;
    font-family: $sans-ui;
    color: $secondary;
    margin: $px-64-spacer 0;
    display: flex;
    gap: $px-8-spacer;
    font-size: 14px;

    &__word {
      padding: 2px;
      transition:
        background 0.35s ease,
        color 0.35s ease;
    }

    &--active {
      border-color: $secondary;
    }

    &--active &__word {
      background: $secondary;
      color: $primary;
    }
  }

  .progress {
    position: absolute;
    margin: $px-16-spacer $px-16-spacer;
    right: 0;
    bottom: 0;

    @include this-and-above('lg') {
      margin: $px-16-spacer $px-64-spacer;
    }

    &__text {
      font-size: clamped(24px, 32px, 480px, 1920px);
      font-family: $sans-ui;
      font-weight: 400;
      white-space: nowrap;
      color: $secondary;
      font-variant-numeric: tabular-nums;
      letter-spacing: 0.02em;
    }
  }

  .projects {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    color: $secondary;

    &__project {
      position: relative;
      /* For absolute positioning of lab indicator */
      flex-shrink: 0;
      /* Prevent shrinking to maintain consistent layout */

      &__image-container {
        position: relative;
      }

      &__info {
        margin: $px-8-spacer $px-16-spacer;
        pointer-events: none;
        font-family: $sans-ui;
        text-transform: uppercase;
        text-rendering: optimizeLegibility;

        /* Force an independent text layer */

        span {
          position: relative;
          margin: 0;
          color: $secondary;
          font-weight: 500;
          display: inline-block;
        }
      }

      &__title {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        font-weight: 500;
        font-variation-settings: 'wght' 500;
        font-size: round(clamped(14px, 16px, 480px, 1920px), 1px) !important;
      }

      &__meta {
        font-size: round(clamped(10px, 11px, 480px, 1920px), 1px);
        top: -4px;
      }

      &__image {
        cursor: pointer;
        width: 85vw;
        /* Mobile-first: larger than viewport for immersive feel */
        height: auto;
        aspect-ratio: 16/9;
        object-fit: cover;
        transform-origin: center;
        image-rendering: -webkit-optimize-contrast;
        image-rendering: optimize-contrast;
        image-rendering: auto;
        backface-visibility: hidden;

        @include this-and-above('sm') {
          width: 75vw;
          /* Slightly smaller on small tablets */
        }

        @include this-and-above('md') {
          width: 60vw;
          /* Medium screens */
        }

        @include this-and-above('lg') {
          width: 50vw;
          /* Desktop - show more context */
        }

        @include this-and-above('xl') {
          width: 45vw;
          /* Large desktop - optimal viewing */
        }
      }
    }

    &__reel {
      display: flex;
      flex-flow: row nowrap;
      column-gap: $px-32-spacer;
      /* Mobile: tight spacing */
      justify-content: flex-start;
      /* Start from left instead of center */
      align-items: center;
      position: absolute;
      left: 0;
      width: max-content;
      /* Allow width to expand based on content */
      padding-left: $px-32-spacer;
      /* Mobile: minimal padding */

      /* Progressive spacing increases */
      @include this-and-above('sm') {
        column-gap: $px-32-spacer;
        padding-left: $px-32-spacer;
      }

      @include this-and-above('lg') {
        column-gap: $px-64-spacer;
        padding-left: $px-64-spacer;
      }
    }

    &__lab-indicator {
      position: absolute;
      top: 8px;
      right: 8px;

      &-svg {
        position: relative;
        width: 24px;
        height: 24px;
        color: #fff;

        @include this-and-above('md') {
          width: 32px;
          height: 32px;
        }
      }
    }
  }

  /* Fade transition for filter changes */
  .fade-enter-active {
    transition: opacity 0.6s ease-in;
  }

  .fade-leave-active {
    transition: opacity 0.4s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  /* Moving light animation */
  @keyframes moveLight {
    0% {
      transform: translateX(-25%);
    }
    50% {
      transform: translateX(0%);
    }
    100% {
      transform: translateX(25%);
    }
  }
</style>
