export default defineEventHandler(async (event) => {
  const { id } = event.context.params || {}

  const data = await readBody<unknown[]>(event)

  return await upload(id, data)
})

async function upload(id: string, data: object) {
  const message = `edit ${id.padEnd(3, ' ')} - desislavsd`
  const content = encode(data)
  const owner = 'desislavsd'
  const repo = 'mornins'
  const path = `public/books/${id}/bg.json`
  const auth = process.env.GITHUB_TOKEN
  const branch = 'edit-books'

  const existingFile = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${auth}`,
      },
    }
  ).then((res) => res.json())

  // return existingFile
  return await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    {
      method: 'PUT',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${auth}`,
      },
      body: JSON.stringify({
        message,
        content,
        sha: existingFile.sha,
        branch,
      }),
    }
  ).then((res) => res.json())
}

function encode(data: object) {
  return btoa(JSON.stringify(data, null, 2))
}

function btoa(str: string) {
  return Buffer.from(str, 'utf8').toString('base64')
}
