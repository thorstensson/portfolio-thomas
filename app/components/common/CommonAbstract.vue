<script setup lang="ts">
  import SplitType from 'split-type'
  import { ScrollTrigger } from 'gsap/ScrollTrigger'

  /* Props interface with camelCase naming convention */
  interface Props {
    label: string
    desc: string
    className: string
    delay: number
    isFullWidth: boolean
    isHero: boolean
    isSecondary: boolean
    isTwoLines: boolean
    isPageHeader: boolean
    author: string
    date: string
    headingLevel?: 'h1' | 'h2'
  }

  const props = withDefaults(defineProps<Props>(), {
    label: '',
    desc: '',
    className: '',
    delay: 0,
    isFullWidth: false,
    isHero: false,
    isSecondary: false,
    isTwoLines: false,
    isPageHeader: false,
    author: '',
    date: '',
    headingLevel: 'h2',
  })

  const { $gsap } = useNuxtApp()
  let ctx: gsap.Context | undefined
  const splitInstances: SplitType[] = []

  const abstractClassObj = computed(() => {
    return {
      'abstract-wrapper--hero--with-desc':
        props.isHero && props.desc && props.desc.trim(),
      'abstract-wrapper--hero': props.isHero,
      'abstract-wrapper--secondary': props.isSecondary,
      'abstract-wrapper--full-width': props.isFullWidth,
    }
  })

  const headerClassObj = computed(() => {
    return {
      'abstract__header--hero': props.isHero && props.desc.trim().length > 0,
      'abstract__header--hero-solo':
        props.isHero && props.desc.trim().length == 0,
      'abstract__header--secondary': props.isSecondary,
      'abstract__header--full-width': props.isFullWidth,
      'abstract__header--page-header': props.isPageHeader,
    }
  })

  /* Computed property to properly split description into sentences */
  const descriptionSentences = computed(() => {
    if (!props.desc || !props.desc.trim()) return []

    /* Split by periods and filter out empty strings */
    const sentences = props.desc
      .split('.')
      .filter((sentence) => sentence.trim())

    /* Add periods back to each sentence with proper spacing */
    return sentences.map((sentence, index) => {
      const trimmedSentence = sentence.trim()
      /* Add period and space, except for the last sentence (no trailing space) */
      return index === sentences.length - 1
        ? trimmedSentence + '.'
        : trimmedSentence + '. '
    })
  })

  onMounted(() => {
    $gsap.registerPlugin(ScrollTrigger)
    /* Context! The friendly GSAP garbage collector */
    ctx = $gsap.context((self) => {
      let secChar = $gsap.utils.toArray(`.${props.className}`)
      secChar.forEach((sec: any) => {
        const splitTxt = new SplitType(sec, { types: 'words' })
        splitInstances.push(splitTxt)
        $gsap.set(splitTxt.words, {
          autoAlpha: 0,
          clipPath: 'polygon(0% 0%, 0% 0%, 0% 110%, 0% 100%)',
        })
        $gsap.to(splitTxt.words, {
          autoAlpha: 1,
          clipPath: 'polygon(0% 0%, 110% 0%, 100% 110%, 0% 100%)',
          delay: props.delay,
          scrollTrigger: {
            trigger: sec,
            start: 'top bottom',
            scrub: false,
            end: 'top top',
            toggleActions: 'restart none none reverse',
            preventOverlaps: true,
            anticipatePin: 1,
          },
          duration: 0.4,
          ease: 'power1.out',
        })
      })
    })
  })

  onUnmounted(() => {
    /* Clean up GSAP context */
    ctx?.revert()

    /* Clean up SplitType instances */
    splitInstances.forEach((instance) => {
      instance.revert()
    })

    /* Clear the array */
    splitInstances.length = 0
  })
</script>

<template>
  <div class="abstract-wrapper" :class="abstractClassObj">
    <div class="abstract">
      <component
        :is="headingLevel"
        v-if="label && label.trim()"
        class="abstract__header"
        :class="[props.className, headerClassObj]"
      >
        {{ label }}
      </component>
      <div v-if="desc && desc.trim()">
        <div
          v-for="(sentence, index) in descriptionSentences"
          :key="index"
          class="abstract__desc"
          :class="props.className"
          :style="{ display: props.isTwoLines ? 'block' : 'inline' }"
        >
          {{ sentence }}
        </div>
      </div>

      <!-- For blog posts -->
      <div class="abstract__info">
        <div v-if="author && author.trim()">
          <div class="abstract__author" :class="props.className">
            by: {{ author }}
          </div>
        </div>
        <div v-if="date && date.trim()">
          <div class="abstract__date" :class="props.className">
            on: {{ date }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  /**
   * Uses dynamic heading element via headingLevel prop for proper
   * semantic document outline (h1 for page titles, h2 for sections).
   */
  .abstract-wrapper {
    display: flex;
    flex-flow: column;
    align-items: flex-start;
    color: $secondary;
    margin: 0;
    height: fit-content;
    width: 100%;
    margin-bottom: $px-32-spacer;

    @include this-and-above('sm') {
      width: 80%;
    }

    &--hero {
      width: 80%;
      margin-bottom: $px-16-spacer;

      &--with-desc {
        margin-bottom: $px-16-spacer;
      }

      @include this-and-above('lg') {
        width: 70%;
      }

      @include this-and-above('xl') {
        width: 55%;
      }
    }

    &--secondary {
      width: 100%;

      @include this-and-above('sm') {
        width: 90%;
      }

      @include this-and-above('md') {
        width: 75%;
      }
    }

    &--full-width {
      margin-bottom: $px-64-spacer;
      width: 100%;
    }
  }

  .abstract {
    &__header {
      position: relative;
      font-size: clamped(54px, 94px, 480px, 1920px);
      flex-wrap: wrap;
      height: max-content;
      margin-bottom: $px-32-spacer;
      font-family: $sans-ui;
      text-transform: none;
      font-weight: 500;
      font-variation-settings: 'wght' 500;
      line-height: 1.1;

      &--hero {
        margin-bottom: $px-16-spacer;
        line-height: 1;
        text-box-trim: both; /* Trims the leading from the top and bottom of the box */
        text-box-edge: cap alphabetic;
      }

      &--hero-solo {
        margin-bottom: 0;
      }

      /* When we need a sub header (smaller) */
      &--secondary {
        font-size: clamped(36px, 48px, 480px, 1920px);
        line-height: 1.2;
      }

      &--full-width {
        margin-bottom: 0;
      }

      &--page-header {
        margin-bottom: $px-16-spacer;
      }

      @include this-and-above('md') {
        margin-bottom: $px-64-spacer;

        &.abstract__header--hero {
          margin-bottom: $px-16-spacer;
        }

        &.abstract__header--hero-solo {
          margin-bottom: 0;
        }

        &--full-width {
          margin-bottom: 0;
        }

        &--page-header {
          margin-bottom: $px-16-spacer;
        }
      }
    }

    &__desc {
      display: inline-block;
      font-family: $sans-text;
      /* Default size for hero sections */
      font-size: clamped(16px, 20px, 480px, 1920px);
      font-weight: 400;

      /* Smaller size when used with secondary headers */
      .abstract__header--secondary + div & {
        font-size: clamped(16px, 18px, 480px, 1920px);
      }
      .abstract__header--page-header + div & {
        font-size: clamped(20px, 36px, 480px, 1920px);
      }
    }

    &__info {
      display: flex;
      flex-wrap: wrap;
      gap: $px-16-spacer;
      font-family: $sans-text;
    }

    &__author,
    &__date {
      position: relative;
      display: inline-block;
      width: 100%;
      font-size: clamped(12px, 16px, 480px, 1920px);
      font-family: $sans-text;
      margin-bottom: $px-32-spacer;
    }
  }
</style>
