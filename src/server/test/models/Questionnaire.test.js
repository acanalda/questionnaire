const should = require('should')

const Questionnaire = require('../../models/Questionnaire')

describe('Questionnaires', () => {
  describe('Static methods', () => {
    it('should return a questionnaire with id 1', () => {
      const run = Questionnaire.get('1')

      should(run.id).eql('1')
    })

    it('should return null when trying to get a non exising run', () => {
      const run = Questionnaire.get('20')

      should(run).eql(null)
    })
  })

  describe('Class methods', () => {
    let questionnaire

    before(() => {
      questionnaire = Questionnaire.get('1')
    })

    it('should return a question with id 1', () => {
      const question = questionnaire.getQuestionById('1')

      should(question.id).eql('1')
    })

    it('should return null when trying to get an non exising question', () => {
      const question = questionnaire.getQuestionById('100')

      should(question).eql(null)
    })

    it('should return a questionIndex with id 1', () => {
      const questionIndex = questionnaire.getQuestionIndexById('1')

      should(questionIndex).eql(0)
    })

    it('should return -1 when the question doesn not exist', () => {
      const questionIndex = questionnaire.getQuestionIndexById('100')

      should(questionIndex).eql(-1)
    })
  })
})
