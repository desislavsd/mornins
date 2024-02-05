<script setup>
import { useI18n } from 'vue-i18n'
const { t, locale, availableLocales } = useI18n()

const next = computed(
  () =>
    availableLocales[
      (availableLocales.indexOf(locale.value) + 1) % availableLocales.length
    ]
)

function toggle() {
  locale.value = next.value
}
</script>

<template>
  <button @click="toggle" class="capitalize">
    {{ t(`locales.${locale}`) }}
  </button>
</template>
