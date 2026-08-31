<script setup lang="ts">
  import * as PIXI from 'pixi.js'
  import { Assets, DisplacementFilter } from 'pixi.js'
  import { ScrollTrigger } from 'gsap/ScrollTrigger'
  import { useFolioStore } from '../../../stores/useFolioStore'
  import SplitType from 'split-type'

  /* PINIA 🍍 */
  const store = useFolioStore()
  const { $gsap } = useNuxtApp()
  const pixiCtx = useTemplateRef<any>('pixi')
  const isFirefox = ref(false)

  let ctx: gsap.Context
  let app: PIXI.Application
  const splitInstances: SplitType[] = []
  let displaceSprite: PIXI.Sprite
  let imageSprite: PIXI.Sprite
  let filter: DisplacementFilter

  /* Store ticker function reference for cleanup */
  const tickerFunction = (delta: any) => {
    if (displaceSprite) {
      displaceSprite.rotation += 0.001
      const scale = 1 + Math.sin(Date.now() * 0.001) * 0.1
      displaceSprite.scale.set(scale)
    }
  }

  /**
   * Rock on.
   */
  onMounted(async () => {
    if (import.meta.client) {
      isFirefox.value = navigator.userAgent.toLowerCase().includes('firefox')

      $gsap.registerPlugin(ScrollTrigger)
      app = new PIXI.Application()

      /* Initialize the application */
      app.init({
        backgroundAlpha: 0,
        canvas: pixiCtx.value,
        width: 800,
        height: 600,
      })

      const image = await Assets.load('/img/orchid-tech.jpg')
      imageSprite = PIXI.Sprite.from(image)

      /* Make imageSprite fill the 800x600 canvas */
      imageSprite.width = 800
      imageSprite.height = 600
      imageSprite.position.set(0, 0)
      imageSprite.anchor.set(0, 0)

      const imageMap = await Assets.load('/img/displacemap-2.jpg')

      displaceSprite = PIXI.Sprite.from(imageMap)

      app.stage.interactive = true
      app.stage.addChild(imageSprite)
      app.stage.addChild(displaceSprite)

      filter = new DisplacementFilter(displaceSprite)

      app.stage.filters = [filter]
      filter.scale.set(100)
      displaceSprite.anchor.set(0.5)
      displaceSprite.setSize(800, 600)

      app.stage
        .on('mousemove', (e: any) => {
          displaceSprite.position.set(e.data.global.x - 25, e.data.global.y)
        })
        .on('touchmove', (e: any) => {
          displaceSprite.position.set(e.data.global.x - 25, e.data.global.y)
        })

      /* Context! The friendly GSAP garbage collector */
      ctx = $gsap.context((self) => {
        let sectionsChar = $gsap.utils.toArray('.split-skills-w')
        sectionsChar.forEach((sec: any) => {
          const splitTxt = new SplitType(sec, { types: 'words' })
          splitInstances.push(splitTxt)
          $gsap.set(splitTxt.words, {
            autoAlpha: 0,
            clipPath: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)',
          })
          $gsap.to(splitTxt.words, {
            autoAlpha: 1,
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
            force3D: true,
            scrollTrigger: {
              trigger: sec,
              start: 'top 90%',
              scrub: false,
              end: 'top 70%',
              toggleActions: 'restart none none reverse',
              refreshPriority: -1, // ← Lower priority
              invalidateOnRefresh: false, // ← Skip expensive refresh
            },
            duration: 0.4,
          })
        })

        if (!isFirefox.value) {
          $gsap.ticker.add(tickerFunction)
        }
      })
    }
  })

  onUnmounted(() => {
    /* Remove GSAP ticker */
    $gsap.ticker.remove(tickerFunction)

    /* Clean up GSAP context */
    ctx?.revert()

    /* Clean up SplitType instances */
    splitInstances.forEach((instance) => {
      instance.revert()
    })
    splitInstances.length = 0

    /* Clean up PIXI resources */
    if (app) {
      /* Remove event listeners from stage */
      if (app.stage) {
        app.stage.removeAllListeners()
        app.stage.filters = []
      }

      /* Destroy individual PIXI objects */
      filter?.destroy()
      imageSprite?.destroy()
      displaceSprite?.destroy()

      /* Destroy the application */
      app.destroy()
    }
  })
</script>

<template>
  <div class="meta-wrapper">
    <main class="meta">
      <CommonLine :pos="'absolute'" :width="''" />
      <!--:className here is for gsap-->
      <CommonAbstract
        class="meta__header"
        :label="store.data.intro?.metaIntroTitle"
        :desc="''"
        :is-page-header="false"
        :class-name="'meta-intro'"
        :is-secondary="true"
        :delay="0"
        :is-full-width="false"
        :is-hero="false"
        :author="''"
        :date="''"
        :is-two-lines="false"
      />
      <CommonInfoLabel
        :label="'Code + Paper'"
        :class-name="'meta-label'"
        :hpos="'center'"
        :hover-label="''"
        :force-white="false"
        :vpos="'flex-start'"
        :link="''"
      />
      <div class="meta__canvas">
        <div class="meta__tech">
          <h5 class="split-skills-w">{{ store.data.intro?.metaTechTitle }}</h5>
          <p class="meta__tech-item split-skills-w">
            {{ store.data.intro?.metaTechDesc }}
          </p>
          <h5 class="split-skills-w">
            {{ store.data.intro?.metaCreativeTitle }}
          </h5>
          <p class="meta__tech-item split-skills-w">
            {{ store.data.intro?.metaCreativeDesc }}
          </p>
          <h5 class="split-skills-w">{{ store.data.intro?.metaIdeTitle }}</h5>
          <p class="meta__tech-item split-skills-w">
            {{ store.data.intro?.metaIdeDesc }}
          </p>
          <h5 class="split-skills-w">
            {{ store.data.intro?.metaPublishTitle }}
          </h5>
          <p class="meta__tech-item split-skills-w">
            {{ store.data.intro?.metaPublishDesc }}
          </p>
          <h5 class="split-skills-w">
            {{ store.data.intro?.metaRepoTitle }}
          </h5>
          <p class="meta__tech-item split-skills-w action" data-name="menu">
            <NuxtLink :to="store.data.intro?.metaRepoUrl">Folio</NuxtLink>
          </p>
        </div>
        <div class="canvas-container">
          <div class="canvas-wrapper">
            <canvas class="meta__img" ref="pixi"></canvas>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style lang="scss" scoped>
  h2,
  h3,
  h4,
  h5 {
    color: #fafafa;
    font-family: $sans-ui;
  }

  .meta-wrapper {
    position: relative;
    overflow: hidden;
    background-color: $primary;
    padding: $px-64-spacer $px-16-spacer;
    height: 100dvh;
    min-height: 100vh;
    margin-bottom: 64px;

    @include this-and-above('sm') {
      padding: $px-128-spacer $px-32-spacer;
    }

    @include this-and-above('md') {
      padding: $px-128-spacer $px-64-spacer;
    }

    @include this-and-above('xl') {
      padding: $px-128-spacer $px-128-spacer;
    }

    @include this-and-above('xxl') {
      padding: $px-128-spacer $px-256-spacer;
    }
  }

  .meta {
    overflow: hidden;
    color: #fafafa;

    &__header {
      position: relative;
      background-color: transparent;
      color: inherit;
      color: $secondary;
    }

    &__canvas {
      display: flex;
      justify-content: center;
      margin: 0 auto;
      width: -moz-fit-content;
    }

    &__tech {
      position: absolute;
      display: flex;
      flex-direction: column;
      align-items: center;
      align-self: center;
      z-index: 1;
      text-align: center;
      padding: 0 40px;

      &-item {
        font-family: $sans-text;
        font-size: clamped(14px, 16px, 380px, 1920px);
        font-variation-settings: 'wght' 400;
        font-weight: 400;

        /* Also target direct links as fallback */
        a {
          text-decoration: none !important; /* Remove the underline */
          border-bottom: 2px solid #fafafa; /* Add border instead */
          padding-bottom: 2px; /* Optional: add some space */
        }
      }

      &-item:nth-child(even) {
        margin-bottom: $px-16-spacer;

        @include this-and-above('md') {
          margin-bottom: $px-32-spacer;
        }
      }
    }
  }
  .canvas-container {
    display: flex;
    justify-content: center;
    height: 450px;

    @include this-and-above('sm') {
      height: 100%;
    }
  }

  .canvas-wrapper {
    overflow: hidden;
    max-width: 100%;

    @media (max-width: 767px) {
      max-width: 90vw;
    }
  }

  canvas {
    display: block;
    pointer-events: none;
    max-width: 100%;
    height: 450px;

    @include this-and-above('sm') {
      height: 100%;
    }
  }
</style>
