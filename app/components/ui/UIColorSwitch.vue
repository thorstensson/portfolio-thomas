<script setup lang="ts">
  const props = defineProps<{
    isMobile: boolean
  }>()

  const model = defineModel({ default: true })
</script>

<template>
  <div>
    <label
      class="ios-switch action"
      data-name="menu"
      :aria-label="model ? 'Switch to dark mode' : 'Switch to light mode'"
    >
      <input
        type="checkbox"
        name="checkbox"
        v-model="model"
        ref="myInput"
        aria-hidden="true"
      />
      <i :class="{ 'mobile-mode': props.isMobile }">
        <Icon
          class="icon"
          :class="{ 'icon--right': isMobile }"
          :name="
            model
              ? 'line-md:sunny-outline-loop'
              : 'line-md:sunny-filled-loop-to-moon-filled-alt-loop-transition'
          "
          :size="isMobile ? 30 : 20"
        />
      </i>
    </label>
  </div>
</template>

/* TODO: for now I give up on trying to get iconify loaded svgs to align without
ugly adjusts */
<style lang="scss" scoped>
  .icon {
    z-index: 999;
    position: relative;
    color: inherit; // Default color
    margin-left: auto;
    bottom: 2px;
    display: flex;
    align-items: center;
  }

  // When mobile-mode class is on the parent <i> element
  .mobile-mode .icon {
    color: $primary; // Inherit from navbar context
  }
  .icon--right {
    right: 6px;
  }

  .ios-switch {
    position: relative;
    display: inline-block;
    cursor: pointer;
    z-index: 99;
    width: 20px;
    height: 20px;
    vertical-align: text-top;

    input {
      display: none;
    }

    i {
      position: relative;
      display: inline-block;
      border-radius: 9px;
      vertical-align: middle;
      transition: all 0.3s;
    }
  }
</style>
