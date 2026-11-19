<script setup lang="ts">
  import { useBlogStore } from '../../../stores/useBlogStore'
  import { useFolioStore } from '../../../stores/useFolioStore'

  const blogStore = useBlogStore()
  const store = useFolioStore()

  const isDesktop = ref(false)

  const dateSorted = computed(() => {
    if (!blogStore.data?.posts) return []

    return [...blogStore.data.posts].sort((a, b) => {
      /* Sort by date descending (newest first), pos number = a after b, neg number = a before b */
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
  })

  const checkScreenSize = () => {
    if (import.meta.client) {
      const wasDesktop = isDesktop.value
      isDesktop.value = window.innerWidth >= 768

      /* Force repaint when breakpoint changes */
      if (wasDesktop !== isDesktop.value) {
        nextTick(() => {
          /* Force reflow to recalculate CSS custom properties */
          void document.body.offsetHeight
        })
      }
    }
  }

  onMounted(() => {
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
  })

  onBeforeUnmount(() => {
    if (import.meta.client) {
      window.removeEventListener('resize', checkScreenSize)
    }
  })
</script>

<template>
  <div class="excerpts-wrapper">
    <div class="excerpts-wrapper__inner">
      <CommonAbstract
        class="blog__header"
        :label="store.data.intro?.blogDesc"
        :desc="''"
        :class-name="'blog-intro'"
        :is-secondary="true"
        :delay="0"
        :is-full-width="false"
        :is-hero="false"
        :is-page-header="false"
        :author="''"
        :date="''"
        :is-page-title="false"
        :is-two-lines="false"
      />

      <main class="excerpts">
        <div class="excerpts__info" v-for="post in dateSorted" :key="post.slug">
          <NuxtLink :to="`/blog-post/${post.slug}`">
            <div class="excerpts__item action" data-name="menu">
              <div class="excerpts__item__title excerpts__item__title--date">
                {{ post.date }}
              </div>
              <div class="excerpts__item__title excerpts__item__title--title">
                {{ post.title }}
              </div>
              <div
                class="excerpts__item__title excerpts__item__title--subject"
                v-if="isDesktop"
              >
                {{ post.subject }}
              </div>
              <div class="excerpts__item__title excerpts__item__title--length">
                {{ post.length }}
              </div>
            </div>
          </NuxtLink>
        </div>
        <div class="excerpts__quote">
          <q>{{ store.data.intro?.blogExcerptsQuote.split('—')[0] }}</q>
          <span>—</span> {{ store.data.intro?.blogExcerptsQuote.split('—')[1] }}
        </div>
      </main>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  a {
    filter: blur(0px) !important;
  }

  .excerpts-wrapper {
    display: flex;
    align-items: center;
    position: relative;
    background-color: $primary;
    padding: $px-128-spacer $px-16-spacer;
    min-height: 100dvh;
    height: 100vh;

    &__inner {
      width: 100%;
    }

    @include this-and-above('lg') {
      padding: $px-128-spacer $px-64-spacer;
    }
  }

  .excerpts {
    position: relative;
    /* So its above the all seeing info label */
    z-index: 200;
    width: 100%;

    &__info {
      font-weight: 400;
      font-variation-settings: 'wght' 400;
    }

    &__quote {
      position: relative;
      margin-top: $px-32-spacer;
      width: 100%;
      left: 50%;
      transform: translateX(-50%);
      text-align: center;
      color: $secondary;
      font-size: clamped(16px, 18px, 480px, 1920px);
      font-style: italic;
      font-weight: 400;
      font-variation-settings: 'wght' 400;

      @include this-and-above('sm') {
        margin-top: $px-256-spacer;
      }
    }

    &__label {
      position: relative;
    }

    &__item {
      position: relative;
      display: grid;
      grid-template-columns: 1fr 2fr 1fr;
      height: 70px;
      align-items: center;
      width: 100%;
      border-bottom: 2px solid rgb(0 0 0 / 0.1);
      overflow: hidden;
      cursor: pointer;
      font-weight: 400;
      font-variation-settings: 'wght' 400;

      @include this-and-above('md') {
        grid-template-columns: 1fr 2fr 1fr 1fr;
      }

      /* Background fill effect */
      &::before {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 0%;
        background-color: $accent2;
        transition: height 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        z-index: 1;
      }

      @media (hover: hover) {
        &:hover {
          &::before {
            height: 100%;
          }

          .excerpts__item__title {
            color: $accent1;
          }
        }
      }

      &__title {
        position: relative;
        z-index: 2;
        color: $secondary;
        padding: 0 10px;
        transition: all 0.3s ease;
        font-size: clamped(14px, 18px, 480px, 1920px);
        font-family: $sans-ui;

        /* Column-specific alignment using BEM modifiers */
        &--date {
          text-align: left;
          font-weight: 500;
        }

        &--title {
          text-align: left;
        }

        &--subject {
          text-align: left;
        }

        &--length {
          text-align: right;
        }
      }
    }
  }
</style>
