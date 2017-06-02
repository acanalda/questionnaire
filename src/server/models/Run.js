const _ = require('lodash')
const uuidV4 = require('uuid/v4')

// Used as in-memory storage (not persistent)
const typesScoreMap = {
  positive: 1,
  negative: -1,
  neutral: 0
}

// Just to give a structure to UserAnswer
// No logic here since this would be part of the Run schema in a NoSQL DB
class UserAnswer {
  constructor(qId) {
    this.id = qId // answerId = questionId
    this.qId = qId
    this.choices = null // It will contain an array length 3 with the values [-1, 0, 1].
                        // Where the index means the choice selected and the value means the suitability level (weight)
                        // -1: Less suitable, 0: Not selected, 1: More suitable
    this.score = null
  }
}

class Run {
  constructor(qstrId) {
    this.qstrId = qstrId // Reference to the questionnaire
    this.id = uuidV4()
    this.uuid = uuidV4() // Meant to be used as a "sessionId" to avoid a user who's not the owner to continue this run
    this.userAnswers = []
    this.totalScore = null
    this.finished = false
  }

  getUserAnswerById(id) {
    return _.find(this.userAnswers, userAnswer => userAnswer.id === id) || null
  }

  addUserAnswer(questions, questionIndex, choices) {
    const question = questions[questionIndex]
    let userAnswer

    // Check if the question exit
    if (!question)
      throw new Error('questionIndex out of range')

    // Check first if the test finished
    if (this.finished)
      throw new Error('Run finished. Can not add or update answers anymore')

    userAnswer = this.getUserAnswerById(question.id)
    if (!userAnswer) {
      // Make sure we don't skip answers before creating a new one
      if (questionIndex !== this.userAnswers.length)
        throw new Error('Answers must be consecutive')

      userAnswer = new UserAnswer(question.id) // We use question.id as answer.id
      this.userAnswers.push(userAnswer)
    }

    this.updateUserAnswer(userAnswer, question, choices)

    // Finish the run if we answered the last question
    if (questions.length === questionIndex + 1) {
      this.finished = true
      this.updateTotalScore()
    }

    return userAnswer
  }

  updateUserAnswer(userAnswer, question, choices) {
    const usedchoices = {} // Used to check if there are duplicated choices (no cheating)

    // Check if choices has length 3
    if (choices.length !== 3)
      throw new Error('choices must have length 3')

    // Update the score and check choices validity (performance reasons)
    userAnswer.score = choices.reduce((acc, option, index) => {
      const answer = question.answers[index]

      if (usedchoices.hasOwnProperty(option))
        throw new Error('User answers do not accept choice duplicates')
      usedchoices[option] = true

      // Check choices are correct [-1, 0, 1]
      if (option !== -1 && option !== 0 && option !== 1)
        throw new Error(`Option ${option} is not valid`)

      return acc + typesScoreMap[answer.type] * option
    }, 0)

    userAnswer.choices = choices
  }

  updateTotalScore() {
    this.totalScore = this.userAnswers.reduce((acc, userAnswer) => acc + userAnswer.score, 0)
  }

}

// --------------------------------- Static methods ---------------------------------

// Create and store a new Run
Run.create = (qstrId) => {
  const run = new Run(qstrId)

  Run.store[run.id] = run

  return run
}

// Get a run by id from the store
Run.get = (runId) => {
  const run = Run.store[runId]

  return run || null
}

Run.cleanScores = (run) => {
  run.totalScore = null
  run.userAnswers.forEach(userAnswer => {userAnswer.score = null})
}

Run.store = {}

module.exports = Run
