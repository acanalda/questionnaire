const _ = require('lodash')

const questionnaireStore = require('../data/sampleData.json')

class Questionnaire {
  constructor(obj) {
    const attribs = ['id', 'title', 'description', 'questions']

    Object.assign(this, _.pick(obj, attribs))
  }

  getQuestionById(qId) {
    return _.find(this.questions, qst => qst.id === qId) || null
  }

  getQuestionIndexById(qId) {
    return _.findIndex(this.questions, qst => qst.id === qId)
  }
}

// --------------------------------- Static methods ---------------------------------

// It returns a questionaire by id from the static store
Questionnaire.get = (qstrId) => {
  const qstData = _.find(Questionnaire.store.questionnaires, qstr => qstr.id === qstrId)

  if (qstData)
    return new Questionnaire(qstData)

  return null
}

// For mock puroses
Questionnaire.store = questionnaireStore

module.exports = Questionnaire
