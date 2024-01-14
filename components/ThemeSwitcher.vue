<script lang="tsx">
import { defineComponent, computed } from 'vue'
import { useNuxtApp, useColorMode, useHead } from '#imports'

export default defineComponent({
  setup(props, {}) {
    const $colorMode = useColorMode()

    const themes = [
      { value: 'system', icon: 'i-carbon-laptop' },
      { value: 'dark', icon: 'i-carbon-moon' },
      { value: 'light', icon: 'i-carbon-sun' },
    ]

    const bgColor = computed(() =>
      $colorMode.value == 'dark' ? '#292e39' : '#ffffff'
    )

    useHead({
      htmlAttrs: {
        'data-theme': computed(() => $colorMode.preference),
      },
      meta: [
        {
          name: 'theme-color',
          content: bgColor,
        },
        {
          name: 'msapplication-TileColor',
          content: bgColor,
        },
      ],
    })

    const theme = computed(() =>
      themes.find(({ value }) => $colorMode.preference == value)
    )

    function toggle() {
      $colorMode.preference =
        // @ts-ignore
        themes[(themes.indexOf(theme.value) + 1) % themes.length].value
    }

    return () => {
      return (
        <button
          class=""
          onClick={toggle}
          title={$colorMode.preference}
          type="button"
        >
          <i class={['!h-4 !w-4', theme.value?.icon]} />
        </button>
      )
    }
  },
})
</script>
<style></style>
