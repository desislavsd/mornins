import {
  getRequestUser,
  getUserByEmail,
  makeActive,
} from '@/server/utils/firebase'

export default defineEventHandler(async (event) => {
  const { email } = (await readBody<{ email: string }>(event)) || {}

  if (!email) return new Response('Bad request', { status: 400 })

  const [user, moderator] = await Promise.all([
    getRequestUser(event),
    getUserByEmail(email),
  ])

  if (!user?.customClaims?.admin)
    return new Response('Unauthorized', { status: 401 })

  // if (moderator?.customClaims?.admin)
  //   return new Response('Bad request', { status: 400 })

  await makeActive(moderator)

  return new Response('OK', { status: 200 })
})
