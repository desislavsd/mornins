import { useToast } from '@/components/ui/toast/use-toast'
import { t } from '@/plugins/i18n'

const ATTEMPTS = 7
let counter = 0
let timeout: NodeJS.Timeout

export function useDevMode() {
  const state = useLocalStorage('dev-mode', false)
  const { toast } = useToast()

  function toggle() {
    state.value = !state.value
  }

  function reset() {
    counter = 0
    clearTimeout(timeout)
  }

  function attemptToggle() {
    counter++
    clearTimeout(timeout)
    timeout = setTimeout(() => (counter = 0), 500)

    if (counter < ATTEMPTS) return

    reset()

    toggle()

    toast({
      title: unref(state)
        ? t('messages.devModeEnabled')
        : t('messages.devModeDisabled'),
    })
  }

  return { state: readonly(state), toggle, attemptToggle }
}
