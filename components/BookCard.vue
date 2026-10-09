<script lang="ts" setup>
import Books from '@/assets/registry.json'
import { isNewBook } from '@/utils'
const lastBook = useLastBook()

const props = defineProps<{
  item: (typeof Books)[number]
}>()
const { item } = reactive(props)
const isNew = computed(() => isNewBook(item))
// both chips share one compact size so they sit as a pair
const chip = 'h-5 px-1.5 py-0 text-[10px] font-medium leading-none'
</script>
<template>
  <Card class="relative flex items-stretch p-6 gap-6">
    <figure
      class="relative w-[61px] -my-6 -ml-6 overflow-hidden rounded-tl-md rounded-bl-md"
    >
      <img
        :src="`/books/${item.id}/img.webp`"
        class="absolute h-full w-full object-cover grayscale-[.7]"
      />
    </figure>
    <CardHeader class="!p-0 flex-1 min-w-0">
      <CardTitle class="whitespace-nowrap text-ellipsis overflow-hidden">{{
        item.name
      }}</CardTitle>
      <CardDescription class="flex items-center gap-2">
        <span>{{ item.author }}</span>
        <Badge
          v-if="isNew"
          variant="secondary"
          :class="chip"
          >{{ $t('messages.new') }}</Badge
        >
        <Badge
          v-if="item.googleTrnaslate"
          variant="secondary"
          :class="[chip, 'tooltip']"
          :data-tip="$t('messages.autoTranslated')"
        >
          <i class="i-carbon-translate text-sm"></i>
        </Badge>
      </CardDescription>
    </CardHeader>
    <CardFooter class="!p-0">
      <Button as-child size="sm" class="capitalize">
        <nuxt-link :to="`/books/${item.id}/today`">{{
          lastBook.value?.id == item.id
            ? $t('actions.continue')
            : $t('actions.read')
        }}</nuxt-link>
      </Button>
    </CardFooter>
  </Card>
</template>
