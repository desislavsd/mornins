<script setup lang="ts">
import { Primitive, type PrimitiveProps } from 'radix-vue'
import { buttonVariants } from '.'
import { cn } from '@/utils'

interface Props extends PrimitiveProps {
  variant?: NonNullable<Parameters<typeof buttonVariants>[0]>['variant']
  size?: NonNullable<Parameters<typeof buttonVariants>[0]>['size']
  as?: string
  onClick?: any
}

const props = withDefaults(defineProps<Props>(), {
  as: 'button',
  onClick: undefined,
})

const busy = ref(false)

const onClick = computed(() => {
  if (!props.onClick) return
  return async (e: Event) => {
    if (busy.value) return
    busy.value = true

    await Promise.allSettled(
      [props.onClick]
        .flat()
        .filter(Boolean)
        .map((fn: any) => fn(e))
    )

    busy.value = false
  }
})
</script>

<template>
  <Primitive
    :as="as"
    :as-child="asChild"
    :class="[
      'relative',
      cn(buttonVariants({ variant, size }), $attrs.class ?? ''),
    ]"
    :onClick="onClick"
    :disabled="busy"
  >
    <slot />
    <span
      v-if="busy"
      class="bg-[inherit] spinner rounded-[inherit] absolute inset-0 grid place-items-center"
    >
      <i class="i-svg-spinners:90-ring-with-bg"></i>
    </span>
  </Primitive>
</template>
<style></style>
