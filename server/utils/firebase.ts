import admin from 'firebase-admin'

export { admin }

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT as string)
    ),
  })
}

export async function getAuthUser(token: string) {
  const { uid } = await admin.auth().verifyIdToken(token)

  return admin.auth().getUser(uid)
}

export async function makeAdmin(user: admin.auth.UserRecord) {
  await admin
    .auth()
    .setCustomUserClaims(user.uid, {
      ...user.customClaims,
      admin: true,
      active: true,
    })
}

export async function makeActive(user: admin.auth.UserRecord) {
  await admin
    .auth()
    .setCustomUserClaims(user.uid, { ...user.customClaims, active: true })
}

export function getRequestUser(event: any) {
  const token = event.headers.get('Authorization')?.split(' ').at(-1)

  if (!token) return

  return getAuthUser(token)
}

export function getUserByEmail(email: string) {
  return admin.auth().getUserByEmail(email)
}
