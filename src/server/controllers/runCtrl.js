const Boom = require('boom')

const runVld = require('../validators/runVld')
const Questionnaire = require('../models/Questionnaire')
const Run = require('../models/Run')

// method:'POST', path:'/questionnaires/{qstrId}/runs'
exports.post = {
  validate: runVld.post,
  response: runVld.postResponse,
  handler: (request, reply) => {
    const qstrId = request.params.qstrId
    const questionnaire = Questionnaire.get(qstrId)
    let run

    // Check if questionnaire exists
    if (!questionnaire)
      return reply(Boom.notFound(`Questionnaire ${qstrId} not found`))

    // Create a new run
    run = Run.create(qstrId)

    return reply(run).code(201)
  }
}

// method:'GET', path:'/questionnaires/{qstrId}/runs/{runId}'
exports.get = {
  validate: runVld.get,
  response: runVld.getResponse,
  handler: (request, reply) => {
    const qstrId = request.params.qstrId
    const runId = request.params.runId
    const questionnaire = Questionnaire.get(qstrId)
    let run

    // Check if questionnaire exists
    if (!questionnaire)
      return reply(Boom.notFound(`Questionnaire ${qstrId} not found`))

    // Get a the run
    run = Run.get(runId)
    if (!run)
      return reply(Boom.notFound(`Run ${runId} not found`))

    // Check if this run belongs to the questionnaire
    if (run.qstrId !== qstrId)
      return reply(Boom.notFound(`Run ${runId} not found`))

    // Remove userAnswers.score if it's not finished (avoid cheating)
    if(!run.finished)
      Run.cleanScores(run)

    return reply(run)
  }
}

// method:'POST', path:'/questionnaires/{qstrId}/runs/{runId}/answers'
exports.postAnswer = {
  validate: runVld.postAnswer,
  response: runVld.postAnswerResponse,
  handler: (request, reply) => {
    const qstrId = request.params.qstrId
    const runId = request.params.runId
    const qId = request.payload.qId
    const choices = request.payload.choices
    const questionnaire = Questionnaire.get(qstrId)
    let questionIndex
    let run
    let answer

    // Check if questionnaire exists
    if (!questionnaire)
      return reply(Boom.notFound(`Questionnaire ${qstrId} not found`))

    // Get a the run
    run = Run.get(runId)
    if (!run)
      return reply(Boom.notFound(`Run ${runId} not found`))

    // Check if this run belongs to the questionnaire
    if (run.qstrId !== qstrId)
      return reply(Boom.notFound(`Run ${runId} not found`))

    try {
      questionIndex = questionnaire.getQuestionIndexById(qId)
      answer = run.addUserAnswer(questionnaire.questions, questionIndex, choices)
    } catch (err) {
      return reply(Boom.preconditionFailed(err.message))
    }

    return reply(answer).code(201)
  }
}

// method:'PUT', path:'/questionnaires/{qstrId}/runs/{runId}/answers/{answerId}'
exports.putAnswer = {
  validate: runVld.putAnswer,
  response: runVld.putAnswerResponse,
  handler: (request, reply) => {
    const qstrId = request.params.qstrId
    const runId = request.params.runId
    const answerId = request.params.answerId
    const choices = request.payload.choices
    const questionnaire = Questionnaire.get(qstrId)
    let questionIndex
    let run
    let answer

    // Check if questionnaire exists
    if (!questionnaire)
      return reply(Boom.notFound(`Questionnaire ${qstrId} not found`))

    // Get a the run
    run = Run.get(runId)
    if (!run)
      return reply(Boom.notFound(`Run ${runId} not found`))

    // Check if this run belongs to the questionnaire
    if (run.qstrId !== qstrId)
      return reply(Boom.notFound(`Run ${runId} not found`))

    // Check if the answer exists
    answer = run.getUserAnswerById(answerId)
    if (!answer)
      return reply(Boom.notFound(`Answer ${answerId} not found`))

    try {
      questionIndex = questionnaire.getQuestionIndexById(answer.qId)
      answer = run.addUserAnswer(questionnaire.questions, questionIndex, choices)
    } catch (err) {
      return reply(Boom.preconditionFailed(err.message))
    }

    return reply(answer).code(201)
  }
}
