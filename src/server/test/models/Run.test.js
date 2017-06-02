const should = require('should')

const Run = require('../../models/Run')

const questionnaireStore = require('../mocks/questionnaires.json')

describe('Runs', () => {
  before(() => {
    Run.store = {}
  })

  describe('Static methods', () => {
    it('should create a new run', () => {
      const run1 = Run.create()

      should.exist(run1.id)
    })

    it('should return a the created run', () => {
      const run = Run.create()

      should(Run.get(run.id).id).eql(run.id)
    })

    it('should return null when trying to get an non exising run', () => {
      const run = Run.get('11')

      should(run).eql(null)
    })
  })

  describe('Class methods', () => {
    let run
    let questions

    before(() => {
      run = Run.create()
      questions = questionnaireStore.questionnaires[0].questions
    })

    describe('addUserAnswer', () => {
      it('should add answer 0 to question 1 (score -1)', () => {
        const questionIndex = 0
        const question = questions[questionIndex]
        const choices = [-1, 0, 1]
        const oldAnswersLength = run.userAnswers.length
        const userAnswer = run.addUserAnswer(questions, questionIndex, choices)

        should(userAnswer.id).eql(question.id)
        should(userAnswer.choices).eql(choices)
        should(userAnswer.score).eql(-1)

        // Length increase
        should(run.userAnswers.length - oldAnswersLength).eql(1)
      })

      it('should add answer 1 to question 1 (score -1)', () => {
        const questionIndex = 1
        const question = questions[questionIndex]
        const choices = [-1, 0, 1]
        const oldAnswersLength = run.userAnswers.length
        const userAnswer = run.addUserAnswer(questions, questionIndex, choices)

        should(userAnswer.id).eql(question.id)
        should(userAnswer.choices).eql(choices)
        should(userAnswer.score).eql(1)

        // Length increase
        should(run.userAnswers.length - oldAnswersLength).eql(1)
      })

      it('should not create an answer (skipped answers)', () => {
        const questionIndex = 0
        const choices = [1, -1, 0]
        let oldAnswersLength

        run.addUserAnswer(questions, questionIndex, choices)
        oldAnswersLength = run.userAnswers.length

        // Try to answer 3 without answering 2
        run.addUserAnswer.bind(run, questions, 3, choices)
          .should.throw('Answers must be consecutive')
        should(run.userAnswers.length - oldAnswersLength).eql(0)
      })

      it('should update the choices of the answer', () => {
        const questionIndex = 0
        const question = questions[questionIndex]
        const choices = [1, -1, 0]
        const oldAnswersLength = run.userAnswers.length
        const userAnswer = run.addUserAnswer(questions, questionIndex, choices)

        should(userAnswer.id).eql(question.id)
        should(userAnswer.choices).eql(choices)

        // No length increase
        should(run.userAnswers.length - oldAnswersLength).eql(0)
      })

      it('should update the answer always with right scores', () => {
        const questionIndex = 0
        let userAnswer

        userAnswer = run.addUserAnswer(questions, questionIndex, [0, 1, -1])
        should(userAnswer.score).eql(-1)

        userAnswer = run.addUserAnswer(questions, questionIndex, [0, -1, 1])
        should(userAnswer.score).eql(1)

        userAnswer = run.addUserAnswer(questions, questionIndex, [1, 0, -1])
        should(userAnswer.score).eql(1)

        userAnswer = run.addUserAnswer(questions, questionIndex, [1, -1, 0])
        should(userAnswer.score).eql(2)

        userAnswer = run.addUserAnswer(questions, questionIndex, [-1, 1, 0])
        should(userAnswer.score).eql(-2)

        userAnswer = run.addUserAnswer(questions, questionIndex, [-1, 0, 1])
        should(userAnswer.score).eql(-1)
      })

      it('should update the totalScore of the run with the right value', () => {
        const questionIndex = 0

        run.addUserAnswer(questions, questionIndex, [0, -1, 1])

        should.not.exist(run.totalScore)
      })

      it('should not update answer (invalid choices length)', () => {
        const questionIndex = 0
        const choices = [1, -1, 0, 1]
        const answer = run.userAnswers[0]
        const oldChoices = answer.choices
        const oldScore= answer.score

        run.addUserAnswer.bind(run, questions, questionIndex, choices)
          .should.throw('choices must have length 3')

        should(answer.choices).eql(oldChoices)
        should(answer.score).eql(oldScore)
      })

      it('should not update an answer (choices should be unique)', () => {
        const questionIndex = 0
        const choices = [1, -1, -1]
        const answer = run.userAnswers[0]
        const oldChoices = answer.choices
        const oldScore= answer.score

        run.addUserAnswer.bind(run, questions, questionIndex, choices)
          .should.throw('User answers do not accept choice duplicates')

        should(answer.choices).eql(oldChoices)
        should(answer.score).eql(oldScore)
      })

      it('should not update an answer (choice value not valid)', () => {
        const questionIndex = 0
        const invalidOption = 2
        const choices = [1, -1, invalidOption]
        const answer = run.userAnswers[0]
        const oldChoices = answer.choices
        const oldScore= answer.score

        run.addUserAnswer.bind(run, questions, questionIndex, choices)
          .should.throw(`Option ${invalidOption} is not valid`)

        should(answer.choices).eql(oldChoices)
        should(answer.score).eql(oldScore)
      })

      it('should finish the run by answering all questions and calculate totalScore', () => {
        const choices = [1, -1, 0]
        let theScore

        run.addUserAnswer(questions, 2, choices)
        run.addUserAnswer(questions, 3, choices)
        theScore = run.userAnswers.reduce((acc, answer) => acc + answer.score, 0)

        should(run.finished).eql(true)
        should(run.totalScore).eql(theScore)
      })

      it('should not allow to update answers after the test finished', () => {
        const choices = [1, -1, 0]

        run.addUserAnswer.bind(run, questions, 3, choices)
          .should.throw('Run finished. Can not add or update answers anymore')
      })
    })

    describe('getUserAnswerById', () => {
      let run

      before(() => {
        const questionIndex = 0
        const choices = [-1, 0, 1]

        Run.store = {}
        run = Run.create()
        run.addUserAnswer(questions, questionIndex, choices)
      })

      it('should return the answer', () => {
        const userAnswer = run.getUserAnswerById('1')

        should(userAnswer).not.eql(null)
      })

      it('should return null when there is no user answer', () => {
        const userAnswer = run.getUserAnswerById('1000')

        should(userAnswer).eql(null)
      })
    })
  })
})
