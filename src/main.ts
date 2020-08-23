import * as core from '@actions/core'
import {postMessage, PostMessageInputs} from './postMessage'

function asStatus(str: string): 'success' | 'failure' {
  if (str !== 'success' && str !== 'failure') {
    throw new TypeError('status must be success or failure')
  }
  return str
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
      scopes: JSON.parse(core.getInput('scopes')).scopes,
      version: core.getInput('version'),
      userIds: JSON.parse(viaEnv(core.getInput('userIds'))),
      slackToken: viaEnv(core.getInput('slackToken')),
      conversationId: viaEnv(core.getInput('channelId')),
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
