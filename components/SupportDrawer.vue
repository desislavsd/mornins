<script setup lang="ts">
import { displayName } from '@@/package.json'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
</script>
<template>
  <Drawer>
    <DrawerTrigger as-child><slot /></DrawerTrigger>
    <DrawerContent
      class="md:max-w-sm md:bottom-6 md:rounded-b-[10px] md:after:hidden mx-auto"
    >
      <DrawerHeader>
        <DrawerTitle class="text-center">
          {{ $t('support.0') }} {{ displayName }}
        </DrawerTitle>
        <DrawerDescription class="text-center">{{
          $t('support.1')
        }}</DrawerDescription>
      </DrawerHeader>
      <div class="px-4 text-sm flex flex-col gap-2 text-center items-center">
        <p>
          {{ $t('support.2') }}
          <strong class="font-bold">
            {{ $t('support.3') }}
          </strong>
        </p>
        <i class="i-sigs-7 !h-20 !w-20"></i>
      </div>
      <DrawerFooter>
        <Button
          class="flex flex-1 capitalize"
          as="a"
          href="https://revolut.me/desislavsd"
          target="_blank"
          rel="noopener"
          >{{ $t('actions.donate') }}
        </Button>
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
</template>
