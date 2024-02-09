<script lang="tsx" setup>
import { useBook, useReadRoute } from '~/composables/useReadPage'

definePageMeta({
  middleware: (to) => {
    if (to.params.date != 'today') return
    navigateTo({
      params: { ...to.params, date: new Date().toISOString().slice(0, 10) },
    })
  },
})

const { id, date, day, month, index, next } = useReadRoute()

const bg = reactive(useBook(id, false))
const en = reactive(useBook(id, true))

const edited = useLocalStorage<(typeof bg)['content'] | null>(
  `edit/${unref(id)}`,
  []
)

const chapter = ref(loadChapter())

const editedDates = computed(() => {
  const startOfYear = new Date(date.value.getFullYear(), 0, 1)
  return (
    unref(edited)?.map((e, i) => {
      if (e.content?.join() === bg.content?.[i].content?.join()) return
      return new Date(+startOfYear + i * 24 * 60 * 60 * 1000)
    }) || []
  )
})

const calendarAttrs = computed(() => [
  {
    key: 'today',
    dot: true,
    dates: editedDates.value?.filter(Boolean) as Date[],
  },
])

watchEffect(() => (chapter.value = loadChapter()))
watchEffect(() => {
  if (unref(edited)?.length) return
  resetBook(true)
})

function loadChapter() {
  return {
    bg: unref(edited)?.[index.value],
    en: en.content?.[index.value],
  }
}

function resetBook(force: boolean = false) {
  if (
    !force &&
    !confirm(
      'Сигурни ли сте че искате да зачистите всички промени и да заредите книгата наново?'
    )
  )
    return
  edited.value = structuredClone(bg.content)
}
function resetChapter(force: boolean = false) {
  if (
    !force &&
    !confirm(
      'Сигурни ли сте че искате да зачистите всички промени и да заредите главата наново?'
    )
  )
    return
  edited.value![unref(index)] = structuredClone(bg.content[unref(index)])
}

function downloadJSON() {
  const data = JSON.stringify(edited.value, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  Object.assign(document.createElement('a'), {
    href: url,
    download: `${unref(id)}.json`,
  }).click()
  URL.revokeObjectURL(url)
}
</script>
<template>
  <div class="min-h-screen flex flex-col">
    <Card class="z-10 sticky top-0 rounded-none bg-background">
      <CardHeader class="flex flex-row items-center justify-between">
        <div class="items-center flex gap-4">
          <Button as-child>
            <NuxtLink :to="{ name: 'books-id-date', params: $route.params }">
              <i class="i-carbon-arrow-left"></i> <i class="i-carbon-book"></i>
            </NuxtLink>
          </Button>
          <Popover>
            <PopoverTrigger as-child>
              <Button class="relative flex items-center gap-2">
                {{ day }}
                <span class="font-normal capitalize">{{ month }}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent class="w-auto p-0">
              <Calendar v-model="date" :attributes="calendarAttrs" />
            </PopoverContent>
          </Popover>
          <CardTitle>{{ bg.book?.name }}</CardTitle>
        </div>
        <div class="flex items-center gap-4">
          <div class="join">
            <Button
              variant="destructive"
              @click="resetChapter()"
              class="tooltip tooltip-bottom join-item gap-2"
              data-tip="Reset changes"
              ><i class="i-carbon-reset"></i> Глава</Button
            >
            <Button
              variant="destructive"
              @click="resetBook()"
              class="tooltip tooltip-bottom join-item gap-2"
              data-tip="Reset changes"
              ><i class="i-carbon-reset"></i> Книга</Button
            >
          </div>
          <Button class="gap-2" @click="downloadJSON"
            ><i class="i-carbon-download"></i> Download</Button
          >
        </div>
      </CardHeader>
    </Card>
    <div
      class="flex-1 grid content-start grid-cols-2 gap-6 p-6 mx-auto max-w-[calc(65ch*2+2*6em)]"
    >
      <template v-for="(_, i) in chapter.bg?.content">
        <div
          v-for="(_, lang) in chapter"
          :is="lang == 'bg' ? 'textarea' : 'p'"
          class="p-2"
          :class="
            lang == 'bg' ? 'relative [white-space:pre-wrap] break-words' : ''
          "
        >
          {{ chapter[lang]?.content?.[i] }}
          <textarea
            v-if="lang == 'bg'"
            v-model="chapter[lang].content[i]"
            class="absolute inset-0 resize-none p-2"
            :class="
              chapter[lang]?.content[i] !== bg.content?.[index].content[i]
                ? 'bg-yellow-50'
                : ''
            "
          ></textarea>
        </div>
      </template>
    </div>
    <!-- <footer
      class="z-10 sticky bottom-0 flex justify-end p-6 gap-6 bg-background"
    >
      
    </footer> -->
  </div>
</template>
<style></style>
