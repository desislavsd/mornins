import { getRequestUser } from '@/server/utils/firebase'
import { update } from '@/server/utils/github'

export default defineEventHandler(async (event) => {
  const { id } = event.context.params || {}

  const user = await getRequestUser(event)

  if (!user?.customClaims?.active)
    return new Response('Unauthorized', { status: 401 })

  // return read
  const data = await readBody<unknown[]>(event)

  return await update({ id, data, email: user.email! })
})
