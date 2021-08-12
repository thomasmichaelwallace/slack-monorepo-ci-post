import * as core from '@actions/core'
import {PostMessageInputs, postMessage} from './post-message'

function asStatus(str: string): PostMessageInputs['status'] {
  const statuses: PostMessageInputs['status'][] = [
    'neutral',
    'success',
    'cancelled',
    'timed_out',
    'failure'
  ]
  if (!statuses.includes(str as PostMessageInputs['status'])) {
    throw new TypeError('status must be success or failure')
  }
  return str as PostMessageInputs['status']
}

function viaEnv(str: string): string {
  if (!(str.startsWith('${') && str.endsWith('}'))) {
    return str
  }
  const name = str.substring(2, str.length - 1)
  const value = process.env[name]
  return value || str
}

async function run(): Promise<void> {
  try {
    const inputs: PostMessageInputs = {
      status: asStatus(core.getInput('status')),
      scopes: JSON.parse(core.getInput('scopes')).scope,
      version: core.getInput('version'),
      userIds: JSON.parse(viaEnv(core.getInput('userIds'))),
      slackToken: viaEnv(core.getInput('slackToken')),
      conversationId: viaEnv(core.getInput('conversationId')),
      repository: core.getInput('repository'),
      stage: core.getInput('stage'),
      commits: JSON.parse(core.getInput('commits')),
      runUrl: core.getInput('runUrl'),
      sourceUrl: core.getInput('sourceUrl'),
      username: core.getInput('username')
    }
    await postMessage(inputs)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
