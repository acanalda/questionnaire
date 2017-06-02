const hapiTest = require('hapi-test')
const should = require('should')

const server = require('../../app')
const apiPrefix = require('../../routes').apiPrefix
const Run = require('../../models/Run')

describe('runCtrl', () => {
  describe('[POST] /questionnaires/{qstrId}/runs', () => {
    before(() => {
      Run.store = {}
    })

    it('should create a new run for questionnaire 1', async function() {
      const runRes = await hapiTest({server}).post(`${apiPrefix}/questionnaires/1/runs`)

      should(runRes.statusCode).eql(201)
      should.exist(runRes.result.id)
      should.exist(runRes.result.uuid)
    })

    it('should return 404', async function() {
      const runRes = await hapiTest({server}).post(`${apiPrefix}/questionnaires/20/runs`)

      should(runRes.statusCode).eql(404)
    })
  })

  describe('[GET] /questionnaires/{qstrId}/runs/{runId}', () => {
    let run

    before(async function() {
      Run.store = {}
      const runRes = await hapiTest({server}).post(`${apiPrefix}/questionnaires/1/runs`)
      run = runRes.result
    })

    it('should return the created Run', async function() {
      const runRes = await hapiTest({server}).get(`${apiPrefix}/questionnaires/1/runs/${run.id}`)

      should(runRes.result.id).eql(run.id)
      should.not.exist(runRes.result.totalScore)
    })

    it('should return 404', async function() {
      const runRes = await hapiTest({server}).get(`${apiPrefix}/questionnaires/1/runs/2`)

      should(runRes.statusCode).eql(404)
    })

    it('should return 404', async function() {
      const runRes = await hapiTest({server}).get(`${apiPrefix}/questionnaires/2/runs/1`)

      should(runRes.statusCode).eql(404)
    })
  })

  describe('[POST] /questionnaires/{qstrId}/runs/{runId}/answers', () => {
    let run
    let finishedRun

    before(async function() {
      Run.store = {}

      // Create new Runs
      const runRes = await hapiTest({server}).post(`${apiPrefix}/questionnaires/1/runs`)
      run = runRes.result

      const runRes2 = await hapiTest({server}).post(`${apiPrefix}/questionnaires/2/runs`)
      finishedRun = runRes2.result
    })

    it('should create a new answer', async function() {
      const payload = {
        qId: '1',
        choices: [-1, 0, 1],
      }
      const answerRes = await hapiTest({server})
        .post(`${apiPrefix}/questionnaires/1/runs/${run.id}/answers`, payload)

      should(answerRes.statusCode).eql(201)
      should.not.exist(answerRes.result.score)
    })

    it('should not create a new answer', async function() {
      const payload = {
        qId: '3',
        choices: [-1, 0, 1],
      }
      const answerRes = await hapiTest({server})
        .post(`${apiPrefix}/questionnaires/1/runs/${run.id}/answers`, payload)

      should(answerRes.statusCode).eql(412)
    })

    it('should set totalScore after answering all the questions', async function() {
      const payload = {
        qId: '1',
        choices: [-1, 0, 1],
      }

      // Post the only answer
      await hapiTest({server})
        .post(`${apiPrefix}/questionnaires/2/runs/${finishedRun.id}/answers`, payload)

      const runRes = await hapiTest({server}).get(`${apiPrefix}/questionnaires/2/runs/${finishedRun.id}`)

      should.exist(runRes.result.totalScore)
      should(runRes.result.finished).eql(true)
    })
  })

  describe('[PUT] /questionnaires/{qstrId}/runs/{runId}/answers/{answerId}', () => {
    let run
    let finishedRun
    let answer
    let lastAnswer

    before(async function() {
      const payload = {
        qId: '1',
        choices: [-1, 0, 1],
      }

      // Clear store
      Run.store = {}

      // Create incomplete run
      const runResult = await hapiTest({server}).post(`${apiPrefix}/questionnaires/1/runs`)
      run = JSON.parse(runResult.payload)
      const answerRes = await hapiTest({server})
        .post(`${apiPrefix}/questionnaires/1/runs/${run.id}/answers`, payload)
      answer = JSON.parse(answerRes.payload)

      // Create complete run
      const finishedRunResult = await hapiTest({server}).post(`${apiPrefix}/questionnaires/2/runs`)
      finishedRun = JSON.parse(finishedRunResult.payload)
      const lastAnswerResult = await hapiTest({server})
        .post(`${apiPrefix}/questionnaires/2/runs/${finishedRun.id}/answers`, payload)
      lastAnswer = JSON.parse(lastAnswerResult.payload)
    })

    it('should update the answer', async function() {
      const payload = {
        choices: [-1, 1, 0],
      }
      const answerRes = await hapiTest({server})
        .put(`${apiPrefix}/questionnaires/1/runs/${run.id}/answers/${answer.id}`, payload)

      should(answerRes.result.choices).eql(payload.choices)
    })

    it('should not update the answer (answer does not exist)', async function() {
      const payload = {
        choices: [-1, 1, 0],
      }
      const answerRes = await hapiTest({server})
        .put(`${apiPrefix}/questionnaires/1/runs/${run.id}/answers/100`, payload)

      should(answerRes.statusCode).eql(404)
    })

    it('should not update the answer (test is over)', async function() {
      const payload = {
        choices: [-1, 1, 0],
      }
      const answerRes = await hapiTest({server})
        .put(`${apiPrefix}/questionnaires/2/runs/${finishedRun.id}/answers/1`, payload)

      should(answerRes.statusCode).eql(412)
      should(answerRes.result.message).eql('Run finished. Can not add or update answers anymore')
    })
  })
})

