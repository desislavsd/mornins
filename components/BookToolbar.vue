<script lang="ts" setup>
import { useToast } from '@/components/ui/toast/use-toast'
import useReadPage from '@/composables/useReadPage'
import { useI18n } from 'vue-i18n'
const devMode = reactive(useDevMode())
const { t } = useI18n()
const props = defineProps<{
  size: string
}>()

const { toast } = useToast()

const { book, day, month, url } = useReadPage()

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
    title: t('messages.linkCopied'),
    description: `${book.value?.name}: ${unref(day)} - ${capitalize(
      unref(month)
    )}`,
  })
}

async function share() {
  if (!navigator.share) return copyUrl()
  try {
    await navigator.share({
      title: `${book.value?.name}: ${unref(day)} - ${capitalize(unref(month))}`,
      text: `${book.value?.name}: ${unref(day)} - ${capitalize(unref(month))}`,
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
      <Button
        as-child
        v-if="devMode.state"
        class="join-item"
        @click="toggleSize()"
      >
        <NuxtLink :to="{ name: 'books-id-date-edit', params: $route.params }">
          <i class="i-carbon-edit"></i>
        </NuxtLink>
      </Button>
    </nav>
    <div
      class="aspect-square rounded-full absolute transition duration-200 bg-foreground h-4 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-delay-200 group:hover-transition-delay-0 group-hover:scale-0"
      :class="classes.dot"
    ></div>
  </div>
</template>
