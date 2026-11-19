<script setup lang="ts">
  const archiveWrapper = ref<HTMLElement>()

  interface Props {
    label: string
    link: string
    linkLabel: string
    target?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    label: '',
    link: '',
    linkLabel: '',
    target: '_self',
  })
</script>

<template>
  <div class="archive-wrapper" ref="archiveWrapper">
    <footer class="archive">
      <div
        class="archive__label action magnet"
        data-name="proj"
        :data-text="props.linkLabel"
        data-color="#FFF"
      >
        <NuxtLink :to="props.link" :target="props.target">{{
          props.label
        }}</NuxtLink>
      </div>
    </footer>
    <CommonInfoLabel
      label="2026 / by Thomas / Nuxt 4."
      :class-name="'photo-label'"
      :hpos="'flex-end'"
      :vpos="'flex-end'"
      :link="'https://github.com/thorstensson'"
      :force-white="false"
      :hover-label="'Moi'"
    />
  </div>
</template>

<style lang="scss" scoped>
  /* same margins as project-wrapper in [id].vue */
  .archive-wrapper {
    position: relative;
    padding: 0 $px-16-spacer;
    overflow: hidden;
    --dot-size: 2px;
    --dot-space: 64px;

    min-height: 100vh;

    background-color: var(--primary);

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: radial-gradient(
        var(--accent2) var(--dot-size),
        transparent var(--dot-size)
      );
      background-size: var(--dot-space) var(--dot-space);
      background-position: 50% 50%;
      background-attachment: fixed;
      opacity: 0.3;
      pointer-events: none;
      z-index: 0;

      @supports (-webkit-touch-callout: none) {
        background-attachment: scroll;
      }
    }

    @include this-and-above('sm') {
      --dot-space: 118px;
    }
  }
  .archive {
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    height: 100vh;

    &__label {
      position: relative;
      display: inline-block;
      z-index: 200;
      font-family: $sans-ui;
      font-size: clamped(36px, 52px, 480px, 1920px);
      font-weight: 500;
      font-variation-settings: 'wght' 500;

      a {
        color: $secondary;
        position: relative;
        text-decoration: underline;
        text-underline-offset: 15px;
        text-decoration-thickness: 2px;
        text-decoration-color: $secondary;
        transition:
          background-size 0.2s cubic-bezier(0.17, 0.67, 0.83, 0.67),
          text-decoration-color 0.2s cubic-bezier(0.17, 0.67, 0.83, 0.67);
        line-height: 1.2;
      }
    }
  }
</style>
