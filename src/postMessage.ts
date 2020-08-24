import * as core from '@actions/core'
import {
  ActionsBlock,
  ContextBlock,
  KnownBlock,
  SectionBlock,
  WebClient
} from '@slack/web-api'

export type PostMessageInputs = {
  status: 'success' | 'failure'
  scopes: string[] // extracted from { scopes: [] }
  version: string | undefined
  userIds: Record<string, string> // parsed from json string
  conversationId: string
  slackToken: string
  repository: string
  stage: string
  commits: string[] // parsed from json string
  runUrl: string
  sourceUrl: string
  username: string
}

function buildMessage(inputs: PostMessageInputs): KnownBlock[] {
  const {
    status,
    scopes,
    version,
    userIds,
    repository,
    stage,
    commits,
    runUrl,
    sourceUrl,
    username
  } = inputs

  const blocks = []

  const headerText =
    status === 'success'
      ? `*${repository}* _${stage}_ has completed :white_check_mark:`
      : `*${repository}* _${stage}_ has failed :no_entry:`
  const header: SectionBlock = {
    type: 'section',
    text: {type: 'mrkdwn', text: headerText}
  }
  blocks.push(header)

  if (scopes.length) {
    const packages: SectionBlock = {
      type: 'section',
      fields: scopes.map(p => {
        const [org, name] = p.split('/')
        const text = `_${org}_/*${name}*`
        return {type: 'mrkdwn', text}
      })
    }
    blocks.push(packages)
  }

  if (version) {
    const release: SectionBlock = {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*release*: https://github.com/${repository}/releases/tag/${version}|${version}>`
      }
    }
    blocks.push(release)
  } else if (commits.length) {
    const historyText = commits.map(c => {
      const [type, ...rest] = c.split(':')
      const lines = rest.join(':').split('\n')
      const message = lines
        .map(l => l.trim())
        .filter(l => l !== '')
        .join(', ')
        .replace(
          /([a-zA-Z/_-]+)#(\d+)/,
          `<https://github.com/$1/issues/$2|#$2>`
        )
      return `*${type}*: ${message}`
    })
    const history: SectionBlock = {
      type: 'section',
      text: {type: 'mrkdwn', text: historyText.join('\n')}
    }
    blocks.push(history)
  }

  const userId = userIds[username]
  const userLink = userId ? `<@${userId}>` : username
  const mention: ContextBlock = {
    type: 'context',
    elements: [{type: 'mrkdwn', text: userLink}]
  }
  blocks.push(mention)

  const actions: ActionsBlock = {
    type: 'actions',
    elements: [
      {
        type: 'button',
        text: {
          type: 'plain_text',
          text: 'Build Log'
        },
        style: status === 'success' ? 'primary' : 'danger',
        url: runUrl
      },
      {
        type: 'button',
        text: {
          type: 'plain_text',
          text: 'Source'
        },
        url: sourceUrl
      }
    ]
  }
  blocks.push(actions)

  return blocks
}

export async function postMessage(inputs: PostMessageInputs): Promise<void> {
  const web = new WebClient(inputs.slackToken)

  const text = `${inputs.repository} ${inputs.stage}: ${inputs.status}`
  const blocks = buildMessage(inputs)
  const message = {
    channel: inputs.conversationId,
    text,
    blocks
  }
  core.debug(`preparing to send slack message: ${JSON.stringify(message)}`)

  const result = await web.chat.postMessage(message)
  if (result.error) throw new Error(result.error)
}
