<script lang="tsx" setup>
const { week, stats } = useStreaks()

const message = computed(() => {
  const { longest, current } = stats
  if (longest == current) return `You are on your longest ${longest} day streak`

  return `Keep up, your longest streak is ${longest} ${
    longest == 1 ? 'day' : 'days'
  }.`
})
</script>
<template>
  <div>
    <div class="leading-[1] flex items-center justify-between">
      <div>
        <span class="text-[6rem]">{{ stats.current }} </span>
        <span class="text-4xl ml-2 relative">
          {{ stats.current == 1 ? 'Day' : 'Days' }}
        </span>
      </div>
      <Button @click="week.today?.go()" variant="ghost" class="mt-2">
        Today
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
        class="aspect-square h-auto w-auto min-w-0 grid place-items-center flex-1"
        as-child
        v-for="item in week.days"
        :variant="item.read ? 'default' : 'outline'"
      >
        <NuxtLink :to="item.to">
          {{ item.name }}
        </NuxtLink>
      </Button>
    </div>
    <p class="mt-2">
      {{ message }}
    </p>
  </div>
</template>
<style></style>
