import {postMessage, PostMessageInputs} from '../src/postMessage'

const mockPostMessage = jest.fn().mockResolvedValue({})
jest.mock('@slack/web-api', () => ({
  WebClient: jest.fn().mockImplementation(() => {
    return {chat: {postMessage: mockPostMessage}}
  })
}))

test('posts a simple message', async () => {
  const input: PostMessageInputs = {
    commits: ['fix: works perfectly\nfixes org/project#123'],
    conversationId: 'conversation_id',
    repository: 'org/project',
    runUrl: 'example.com/actions/this_run',
    scopes: [...Array(12)].map((_, i) => `@org/project-${i}`),
    slackToken: 'my_slack_token',
    sourceUrl: 'example.com/sources/this_push',
    stage: 'development',
    status: 'success',
    userIds: {user_one: 'slack_user_one', user_two: 'slack_user_two'},
    username: 'user_two',
    version: undefined
  }
  await postMessage(input)
  expect(mockPostMessage).toMatchSnapshot()
})
