<script lang="ts" setup>
import Books from '@/assets/registry.json'

const props = defineProps<{
  item: (typeof Books)[number]
}>()
const { item } = reactive(props)
</script>
<template>
  <Card class="relative flex justify-between items-center">
    <CardHeader>
      <CardTitle>{{ item.name }}</CardTitle>
      <CardDescription>{{ item.author }}</CardDescription>
    </CardHeader>
    <!-- <CardContent class="pt-6">
      <img
        :src="`/books/${item.id}/img.webp`"
        class="w-10 object-cover rounded-md"
      />
    </CardContent> -->
    <CardFooter class="pt-6">
      <Button as-child>
        <nuxt-link :to="`/books/${item.id}/today`">Read</nuxt-link>
      </Button>
    </CardFooter>
  </Card>
</template>
