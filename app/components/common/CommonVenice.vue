<!--
  Venice blinds: markup and styles only, no logic.
  Animated by class from app.vue (intro) and middleware/page.global.ts
  (page transitions), so it must render immediately in app.vue:
  not Lazy, not inside ClientOnly, not inside NuxtPage.
-->
<template>
  <div class="venice">
    <div v-for="n in 15" :key="n" class="venice__blind"></div>
  </div>
</template>

<style lang="scss" scoped>
  .venice {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    height: 100dvh;
    position: fixed;
    z-index: 9999;
    pointer-events: none;
    background-repeat: no-repeat;
    background-position: center center;
    visibility: visible;
    overflow: hidden;
    display: flex;
    contain: layout style paint;
    will-change: opacity, visibility;
    transform: translateZ(0); /* Force hardware acceleration */
    backface-visibility: hidden;
    perspective: 1000px; /* Add perspective for 3D rotation */
    pointer-events: none;

    &__blind {
      position: relative;
      top: 0;
      overflow: hidden;
      flex: 1;
      height: 100%;
      background-color: $primary;
      margin-left: -1px;
      will-change: transform, opacity;
      transform: translateZ(0); /* Force hardware acceleration */
      backface-visibility: hidden;
      contain: layout style paint;
      pointer-events: none;

      &:first-child {
        margin-left: 0;
      }
    }
  }
</style>
