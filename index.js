'use strict'

const core = require('@actions/core')
const { GitHub, context } = require('@actions/github')

const main = async () => {
  const token = core.getInput('github-token')
  const branch = core.getInput('branch')
  const base = core.getInput('base')
  const author = core.getInput('author')
  const state = core.getInput('state')
  const sort = core.getInput('sort')
  const direction = core.getInput('direction')
  const title = core.getInput('title')

  const query = {
    ...context.repo,
    state
  }
  if (branch) {
    query.head =
      branch.indexOf(':') === -1 ? `${context.repo.owner}:${branch}` : branch
  }
  if (base) {
    query.base = base
  }
  if (sort) {
    query.sort = sort
  }
  if (direction) {
    query.direction = direction
  }

  const octokit = new GitHub(token)

  const res = await octokit.pulls.list(query)
  const pr =
    res.data.length &&
    res.data.filter(
      pr =>
        (!author || pr.user.login === author) &&
        (!title || pr.title.match(new RegExp(title)))
    )[0]

  core.debug(`pr: ${JSON.stringify(pr, null, 2)}`)
  core.setOutput('number', pr ? pr.number : '')
  core.setOutput('head-sha', pr ? pr.head.sha : '')
  core.setOutput('state', pr ? pr.state : '')
}

main().catch(err => core.setFailed(err.message))
