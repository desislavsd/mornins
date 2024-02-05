<script lang="ts" setup>
import Books from '@/assets/registry.json'
const lastBook = useLastBook()

const props = defineProps<{
  item: (typeof Books)[number]
}>()
const { item } = reactive(props)
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
      <CardDescription>{{ item.author }}</CardDescription>
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
