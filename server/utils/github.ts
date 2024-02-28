export function read(id: string) {
  return fetch(
    `https://api.github.com/repos/desislavsd/mornins/contents/public/books/${id}/bg.json?ref=${process.env.GITHUB_MODERATOR_BRANCH}`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      },
    }
  ).then((res) => res.json())
}

export async function update({
  id,
  data,
  email,
}: {
  id: string
  data: object
  email: string
}) {
  const message = `edit ${id.padEnd(3, ' ')} - ${email}`
  const content = encode(data)

  const existingFile = await read(id)

  return await fetch(
    `https://api.github.com/repos/desislavsd/mornins/contents/public/books/${id}/bg.json`,
    {
      method: 'PUT',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      },
      body: JSON.stringify({
        message,
        content,
        sha: existingFile.sha,
        branch: process.env.GITHUB_MODERATOR_BRANCH,
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
