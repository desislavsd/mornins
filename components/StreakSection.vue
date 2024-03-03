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
const { t } = useI18n()

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
        :variant="item.read ? 'default' : 'outline'"
      >
        <NuxtLink :to="item.to">
          {{ item.name }}
        </NuxtLink>
      </Button>
    </div>

    <Accordion type="single" class="w-full" collapsible>
      <AccordionItem value="heatmap" class="!border-none -ml-4">
        <template #default="{ open }">
          <AccordionTrigger class="pl-4">
            {{ message }}
          </AccordionTrigger>

          <div
            class="transition-height"
            :data-state="open ? 'opened' : 'closed'"
          >
            <div class="overflow-hidden">
              <HeatMap class="pb-4" />
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
