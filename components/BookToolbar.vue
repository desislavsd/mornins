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

const emit = defineEmits(['update:size'])

const sizes = ['prose-sm', '', 'prose-lg', 'prose-xl']

const sizeModel = useVModel(props, 'size', emit)

const bounds = inject('bounds') as any

function toggleSize() {
  const index = sizes.indexOf(sizeModel.value)
  const nextIndex = (index + 1) % sizes.length
  sizeModel.value = sizes[nextIndex]
}

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
const classes = computed(() => {
  const bounded = bounds.start || bounds.end

  return {
    nav: bounded && '!scale-100 !pointer-events-auto',
    dot: bounded && '!scale-0 !transition-delay-0',
  }
})
</script>
<template>
  <div class="relative group">
    <nav
      class="join transition duration-200 relative z-10 scale-0 pointer-events-none group-hover:scale-100 group-hover:pointer-events-auto"
      :class="classes.nav"
    >
      <Button as-child>
        <nuxt-link to="/" class="join-item">
          <i class="i-carbon-home"></i>
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
      class="aspect-square rounded-full absolute transition duration-200 bg-foreground h-4 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-delay-200 group:hover-transition-delay-0 group-hover:scale-0"
      :class="classes.dot"
    ></div>
  </div>
</template>
