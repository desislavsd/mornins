import {
  getAuth,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth'
import { app } from '@/plugins/firebase'

const provider = new GoogleAuthProvider()

const service = getAuth(app)

export const auth = reactive({
  user: null as (typeof service)['currentUser'] | null,
  login,
  service,
})

onAuthStateChanged(service, (user) => (auth.user = user))

async function login() {
  await signInWithPopup(service, provider)
  return auth
}

export default defineNuxtPlugin(() => {})
