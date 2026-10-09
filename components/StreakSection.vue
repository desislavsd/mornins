<script lang="tsx" setup>
import { useI18n } from 'vue-i18n'
import { capitalize } from '@/utils'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
const { week, stats } = useStreaks()
const { index } = useToday()
const { t } = useI18n()

// The heatmap renders ~365 tooltip triggers; mount it only once it is first
// opened so the homepage stays cheap to navigate to.
const opened = ref<string>()
const heatmapMounted = ref(false)
watch(opened, (v) => v && (heatmapMounted.value = true))

function dayVariant(item: { read: boolean; index: number }) {
  if (item.read) return 'default'
  // passed days that were not read: muted, like the heatmap tiles
  if (item.index < index.value) return 'secondary'
  return 'outline'
}

const message = computed(() => {
  const { longest: days, current } = stats
  if (days == current) return t('messages.onStreak', { days }, days)

  return t('messages.keepUp', { days }, days)
})
</script>
<template>
  <div>
    <div class="leading-[1] flex items-center justify-between">
      <div>
        <span class="text-[6rem]">{{ stats.current }} </span>

        <span class="text-4xl ml-2 relative">
          {{ capitalize($t('d.day', stats.current || 0)) }}
        </span>
      </div>
      <Button @click="week.today?.go()" variant="ghost" class="mt-2 capitalize">
        {{ $t('d.today') }}
        <i
          class="ml-2"
          :class="
            week.today?.read ? 'i-carbon-checkmark' : 'i-carbon-arrow-right'
          "
        ></i>
      </Button>
    </div>
    <div class="flex gap-[4%] mt-2">
      <Button
        class="aspect-square h-auto w-auto min-w-0 flex items-center flex-1 capitalize"
        as-child
        v-for="item in week.days"
        :variant="dayVariant(item)"
      >
        <NuxtLink :to="item.to" class="relative">
          {{ item.name }}
          <!-- today marker -->
          <span
            v-if="item.index == index"
            class="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-current"
          ></span>
        </NuxtLink>
      </Button>
    </div>

    <Accordion type="single" class="w-full" collapsible v-model="opened">
      <AccordionItem value="heatmap" class="!border-none -ml-4">
        <template #default="{ open }">
          <AccordionTrigger class="pl-4 text-left">
            {{ message }}
          </AccordionTrigger>

          <div
            class="transition-height"
            :data-state="open ? 'opened' : 'closed'"
          >
            <div class="overflow-hidden">
              <HeatMap v-if="heatmapMounted" class="pb-4 pl-4" />
            </div>
          </div>
        </template>
      </AccordionItem>
    </Accordion>
  </div>
</template>
<style>
.transition-height {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 200ms ease-out;
  &[data-state='opened'] {
    grid-template-rows: 1fr;
  }
}
</style>
