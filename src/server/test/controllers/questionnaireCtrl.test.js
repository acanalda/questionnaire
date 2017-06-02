const hapiTest = require('hapi-test')
const should = require('should')

const Run = require('../../models/Run')
const server = require('../../app')
const apiPrefix = require('../../routes').apiPrefix

describe('questionnaireCtrl', () => {
  describe('[GET] /questionnaires/{qstrId}', () => {
    it('should return 200 and a questionnaire with id=1', async () => {
      const questRes = await hapiTest({server}).get(`${apiPrefix}/questionnaires/1`)

      should(questRes.statusCode).eql(200)
      should(questRes.result.id).eql('1')
    })

    it('should return 404', async () => {
      const questRes = await hapiTest({server}).get(`${apiPrefix}/questionnaires/20`)

      should(questRes.statusCode).eql(404)
    })
  })

  describe('[GET] questionnaires/{qstrId}/questions/{qId}/next', () => {
    let run1
    let run2

    before(async () => {
      const payload = {
        qId: '1',
        choices: [-1, 0, 1],
      }

      Run.store = {}

      // Create new Run + answer
      // Questionnaire 1
      const run1Res = await hapiTest({server}).post(`${apiPrefix}/questionnaires/1/runs`)
      run1 = run1Res.result
      await hapiTest({server}).post(`${apiPrefix}/questionnaires/1/runs/${run1.id}/answers`, payload)

      // Questionnaire 2
      const run2Res = await hapiTest({server}).post(`${apiPrefix}/questionnaires/2/runs`)
      run2 = run2Res.result
      await hapiTest({server}).post(`${apiPrefix}/questionnaires/2/runs/${run2.id}/answers`, payload)
    })

    it('should return 403 (No x-run-id)', async function() {
      const questRes = await server.inject({
        method: 'GET',
        url: `${apiPrefix}/questionnaires/1/questions/1/next`,
      })

      should(questRes.statusCode).eql(403)
      should(questRes.result.message).eql('No x-run-id provided in headers')
    })

    it('should return 403 (Run does not exist)', async function() {
      const questRes = await server.inject({
        method: 'GET',
        url: `${apiPrefix}/questionnaires/1/questions/1/next`,
        headers: { 'x-run-id': '100' },
      })

      should(questRes.statusCode).eql(403)
      should(questRes.result.message).eql('Run with id=100 does not exist')
    })

    it('should return 403 (current question not answered)', async function() {
      const questRes = await server.inject({
        method: 'GET',
        url: `${apiPrefix}/questionnaires/1/questions/2/next`,
        headers: { 'x-run-id': run1.id },
      })

      should(questRes.statusCode).eql(403)
      should(questRes.result.message).eql('Can not move to next question before answering the current one')
    })

    it('should return 200', async function() {
      const questRes = await server.inject({
        method: 'GET',
        url: `${apiPrefix}/questionnaires/1/questions/1/next`,
        headers: { 'x-run-id': run1.id },
      })

      should(questRes.statusCode).eql(200)
      should(questRes.result.id).eql('2')
    })

    it('should return 410 after answering all questions and requesting next', async function() {
      const questRes = await server.inject({
        method: 'GET',
        url: `${apiPrefix}/questionnaires/2/questions/1/next`,
        headers: { 'x-run-id': run2.id },
      })

      should(questRes.statusCode).eql(410)
    })
  })
})

