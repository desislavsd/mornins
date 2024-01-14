<script lang="ts" setup>
import { useBook } from '@/composables/useBook'
const props = defineProps<{
  shrinked: boolean
}>()
const { item, date, day, month } = useBook()

const emit = defineEmits(['update:date'])

const dateModel = useVModel(date, 'value', emit)
</script>
<template>
  <Card
    class="sticky top-0 flex justify-between items-center rounded-none bg-background z-10"
  >
    <CardHeader
      class="transition-all duration-100 transition-delay-200 min-w-0"
      :class="{
        'py-2': shrinked,
      }"
    >
      <CardTitle
        class="whitespace-nowrap overflow-hidden [text-overflow:ellipsis]"
        >{{ item.name }}</CardTitle
      >
      <transition>
        <CardDescription v-show="!shrinked">{{ item.author }}</CardDescription>
      </transition>
    </CardHeader>
    <!-- <CardContent class="pt-6">
      <img
        :src="`/books/${item.id}/img.webp`"
        class="w-10 object-cover rounded-md"
      />
    </CardContent> -->
    <CardFooter
      class="pt-6 transition-all duration-100 transition-delay-200"
      :class="{
        'py-2': shrinked,
      }"
    >
      <Popover>
        <PopoverTrigger as-child>
          <Button
            class="flex items-center"
            :class="shrinked ? 'gap-2' : 'flex-col aspect-square h-auto py-0'"
          >
            <div :class="shrinked ? 'text-base' : 'text-xl'">
              {{ day }}
            </div>
            <span class="font-normal capitalize">{{ month }}</span>
            <!-- <transition>
            </transition> -->
          </Button>
        </PopoverTrigger>
        <PopoverContent class="w-auto p-0">
          <Calendar v-model="dateModel" />
        </PopoverContent>
      </Popover>
    </CardFooter>
  </Card>
</template>
