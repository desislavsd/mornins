<script lang="ts" setup>
import { auth } from '@/plugins/auth'
import { useToast } from '@/components/ui/toast/use-toast'
import { TOAST_DURATION } from '~/config'
const { toast } = useToast()

const form = reactive({ email: '' })

async function activate() {
  const { email } = form

  if (!email) {
    return toast({ title: 'Validation', description: 'Email is required' })
  }

  if (!auth.user) await auth.login()

  const res = await fetch(`/api/activate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await auth.service.currentUser?.getIdToken()}`,
    },
    body: JSON.stringify({ email }),
  })

  if (!res.ok) {
    console.log(res)
    return toast({
      title: 'Error activating',
      variant: 'destructive',
      duration: TOAST_DURATION,
    })
  }

  toast({
    title: 'Activation successful',
    description: `${email} has been activated`,
    duration: TOAST_DURATION,
  })
}
</script>

<template>
  <div class="p-4">
    <form @submit.prevent="activate" class="flex gap-4">
      <Input
        v-model.trim="form.email"
        type="email"
        label="Email"
        placeholder="mail@mail.com"
        required
      />
      <Button type="submit">Activate</Button>
    </form>
  </div>
</template>
<style></style>
