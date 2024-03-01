<script lang="ts" setup>
import { useToast } from '@/components/ui/toast/use-toast'
import { t } from '@/plugins/i18n'
import { displayName, description } from '@@/package.json'

const { toast } = useToast()
const {
  public: { siteUrl },
} = useRuntimeConfig()

function copyUrl() {
  navigator.clipboard.writeText(siteUrl)
  toast({
    title: t('messages.linkCopied'),
    description: siteUrl,
  })
}

async function share() {
  if (!navigator.share) return copyUrl()
  try {
    await navigator.share({
      title: displayName,
      text: description,
      url: siteUrl,
    })
  } catch (error) {
    console.error(error)
    copyUrl()
  }
}
</script>
<template>
  <footer
    class="app-footer relative md:z-10 flex items-center justify-between w-full bg-dark text-light p-6 shadow-dark shadow-lg"
  >
    <div class="flex gap-2 items-center">
      <i class="i-sigs-7 aspect-[2/1.6] !w-[40px] !h-auto relative top-[2px]" />
      <div class="text-left pl-2 text-sm">
        <div>Mornins</div>
        <div class="opacity-50 text-xs">All rights reserved &copy; 2024</div>
      </div>
    </div>
    <div class="flex items-center -mr-3">
      <Button
        as="a"
        href="https://revolut.me/desislavsd"
        target="_blank"
        rel="noopener"
        size="sm"
        variant="ghost"
        class="flex gap-2"
      >
        <i class="i-fluent-drink-coffee-16-regular text-base"></i>
      </Button>
      <Button
        size="sm"
        variant="ghost"
        class="flex gap-2"
        as="a"
        href="mailto:contact@mornins.com"
      >
        <i class="i-carbon-at text-base"></i>
      </Button>
      <Button size="sm" variant="ghost" class="flex gap-2" @click="share">
        <i class="i-carbon-share text-base"></i>
      </Button>
    </div>
  </footer>
</template>

<style>
.app-footer {
  animation: footer 1s alternate linear both;
  animation-timeline: view(block);
  animation-range: cover 0% entry 100%;
}
@keyframes footer {
  0% {
    opacity: 0;
    transform: translate(0, -30%);
  }
  100% {
    opacity: 1;
    transform: translate(0, 0);
    box-shadow: none;
  }
}
</style>
