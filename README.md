# slack-monorepo-ci-post

Slack Monorepo CI/CD Post

Post CI/CD result from a monorepo (Lerna) built to Slack

## Inputs

```yaml
  # required in with:
  status:
    required: true
    description: job status as "success" or "failure"
  scopes:
    required: true
    description: 'built scopes as a json string in the form { "scopes": ["@org/name-1", "@org/name-2"] }'
  # optional in with:
  version:
    required: false
    description: 'if provided, the version will be reported as built, instead of the commit messages'
  # required with defaults set by environment:
  userIds:
    required: true
    default: ${SLACK_USER_ID_MAP}
    description: 'json string map of github actor logins to slack user ids, e.g. { "github-cat": "u123456" }'
  conversationId:
    required: true
    default: ${SLACK_CONVERSATION_ID}
    description: conversation id to send notification to
  slackToken:
    required: true
    description: slack bot user oauth access token
    default: ${SLACK_BOT_TOKEN}
  # required with defaults set by context:
  repository:
    required: true
    description: repository to report built
    default: ${{ github.repository }}
  stage:
    required: true
    description: stage/job that has completed
    default: ${{ github.workflow }}
  commits:
    required: true
    description: 'commit messages as a json string array, e.g. ["message one", "message two"]'
    default: ${{ toJson(github.event.commits.*.message) }}
  runUrl:
    required: true
    description: url for this current run
    default: https://github.com/${{ github.repository }}/actions/runs/${{ github.run_id }}
  sourceUrl:
    required: true
    description: url for the source used in this current run
    default: ${{ github.event.compare }}
  username:
    required: true
    description: username for the user that started this run
    default: ${{ github.actor }}
```

### Example usage

```yaml
jobs:
  # other jobs

  notify-status:
    runs-on: ubuntu-latest
    needs: [final, job, ids]
    if: always()
    steps:
      - name: Get workflow status
        uses: technote-space/workflow-conclusion-action@v1 # https://github.com/technote-space/workflow-conclusion-action
      - name: 'Notify'
        uses: DevicePilot/slack-monorepo-ci-post@v1
        env:
          SLACK_USER_ID_MAP: ${{ secrets.SLACK_USER_ID_MAP }}
          SLACK_CONVERSATION_ID: ${{ secrets.SLACK_CONVERSATION_ID }}
          SLACK_BOT_TOKEN: ${{ secrets.SLACK_BOT_TOKEN }}
        with:
          status: ${{ env.WORKFLOW_CONCLUSION }}
          scopes: ${{ needs.pre-build.outputs.scopes }}
```
