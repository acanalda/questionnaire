const Boom = require('boom')

const Questionnaire = require('../models/Questionnaire')
const questionnaireVld = require('../validators/questionnaireVld')
const Run = require('../models/Run')

const checkRun = (request, reply) => {
  let runId
  let run

  if (!request.headers.hasOwnProperty('x-run-id'))
    return reply(Boom.forbidden('No x-run-id provided in headers'))

  runId = request.headers['x-run-id']
  run = Run.get(runId)
  if (!run)
    return reply(Boom.forbidden(`Run with id=${runId} does not exist`))

  request.run = run

  return reply.continue()
}

// method:'GET', path:'/questionnaires/{qstrId}'
exports.get = {
  validate: questionnaireVld.get,
  response: questionnaireVld.getResponse,
  handler: (request, reply) => {
    const qstrId = request.params.qstrId
    const questionnaire = Questionnaire.get(qstrId)

    // Check if questionnaire exists
    if (!questionnaire)
      return reply(Boom.notFound(`Questionnaire ${qstrId} not found`))

    return reply(questionnaire)
  }
}

// method:'GET', path:'/questionnaires/{qstrId}/questions/{qId}/next'
exports.getNextQuestion = {
  pre: [
    { method: checkRun, assign: 'run' }
  ],
  validate: questionnaireVld.getNextQuestion,
  response: questionnaireVld.getNextQuestionResponse,
  handler: (request, reply) => {
    const qstrId = request.params.qstrId
    const qId = request.params.qId
    const questionnaire = Questionnaire.get(qstrId)
    let questionIndex

    // Check if questionnaire exists
    if (!questionnaire)
      return reply(Boom.notFound(`Questionnaire ${qstrId} not found`))

    questionIndex = questionnaire.getQuestionIndexById(qId)

    if (questionIndex >= 0) {
      // Check if the run already contains an answer for the current question
      if (request.run.userAnswers.length <= questionIndex)
        return reply(Boom.forbidden('Can not move to next question before answering the current one'))

      // If we are requesting the next question after the last one, it means user finished the test
      if (questionIndex === questionnaire.questions.length - 1)
        return reply(Boom.resourceGone('Last question already reached'))
      else
        question = questionnaire.questions[questionIndex + 1]
    } else { // If the question does not exist, means that we have to return the first question
      question = questionnaire.questions[0]
    }

    return reply(question)
  }
}
