import * as core from '@actions/core'
import {postMessage, PostMessageInputs} from './postMessage'

function asStatus(str: string): 'success' | 'failure' {
  if (str !== 'success' && str !== 'failure') {
    throw new TypeError('status must be success or failure')
  }
  return str
}

async function run(): Promise<void> {
  try {
    const inputs: PostMessageInputs = {
      status: asStatus(core.getInput('status')),
      repository: core.getInput('repository'),
      stage: core.getInput('stage'),
      scopes: JSON.parse(core.getInput('scopes')).scopes,
      commits: JSON.parse(core.getInput('commits')),
      version: core.getInput('version'),
      runUrl: core.getInput('runUrl'),
      sourceUrl: core.getInput('sourceUrl'),
      username: core.getInput('username'),
      userIds: JSON.parse(core.getInput('userIds')),
      slackToken: core.getInput('slackToken'),
      conversationId: core.getInput('channelId')
    }
    await postMessage(inputs)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
