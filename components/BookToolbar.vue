<script lang="ts" setup>
import Books from '@/assets/registry.json'
import { sleep } from '@/utils'
import { useToast } from '@/components/ui/toast/use-toast'
import { useBook } from '@/composables/useBook'

const props = defineProps<{
  size: string
}>()

const { toast } = useToast()

const { item, date, day, month, url } = useBook()

const shrinked = ref(false)

const emit = defineEmits(['update:size'])

const sizes = ['prose-sm', '', 'prose-lg', 'prose-xl']

const sizeModel = useVModel(props, 'size', emit)

function toggleSize() {
  const index = sizes.indexOf(sizeModel.value)
  const nextIndex = (index + 1) % sizes.length
  sizeModel.value = sizes[nextIndex]
  console.log({ index, nextIndex })
}
sleep(2000).then(() => {
  shrinked.value = true
})

function copyUrl() {
  navigator.clipboard.writeText(url.value)
  toast({
    title: 'Линка към страницата е копиран',
    description: `${item.value.name}${unref(day)} - ${unref(month)}`,
  })
}
async function share() {
  if (!navigator.share) return copyUrl()
  try {
    await navigator.share({
      title: `${item.value.name}${unref(day)} - ${unref(month)}`,
      text: `${item.value.name}${unref(day)} - ${unref(month)}`,
      url: url.value,
    })
  } catch (error) {
    console.error(error)
    copyUrl()
  }
}
</script>
<template>
  <div
    class="relative"
    @mouseenter="shrinked = false"
    @mouseleave="shrinked = true"
  >
    <nav
      class="join transition duration-200 relative z-10"
      :class="shrinked ? 'scale-0 pointer-events-none' : ''"
    >
      <Button as-child>
        <nuxt-link to="/" class="join-item">
          <i class="i-carbon-book"></i>
        </nuxt-link>
      </Button>
      <Button class="join-item" @click="share"
        ><i class="i-carbon-share"></i
      ></Button>
      <Button class="join-item" @click="toggleSize()">
        <i class="i-carbon-text-font"></i>
      </Button>
      <Button class="join-item" as-child>
        <ThemeSwitcher />
      </Button>
    </nav>
    <div
      class="aspect-square rounded-full absolute transition duration-200 bg-foreground h-4 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      :class="shrinked ? 'transition-delay-200' : 'scale-0'"
    ></div>
  </div>
</template>
