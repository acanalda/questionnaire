import { observable, action, computed } from 'mobx'

import * as Api from '../providers/api'

// TODO: Wrap server responses into Classes (Inerfaces would do the job in TypeScript)
class AppState {
  @observable questionnaire // It does not contain the questions
  @observable run // It contains the run.id and other data like `totalScore` when the questionnaire is finished

  @observable questions = []  // Loaded 1 by 1 (avoid cheating)
  @observable userAnswers = [] // Added 1 by 1 at the same pace as loaded questions
  @observable curQuestionIdx = -1 // Used also as answer index
  @observable isLastQuestionReached = false

  @observable questionnaireErr

  constructor() {
    Api.addInterceptors(this)
  }

  // ------------------------- Computed getters ---------------------------
  @computed
  get curQuestion () {
    return this.questions[this.curQuestionIdx]
  }

  @computed
  get curUserAnswer () {
    return this.userAnswers[this.curQuestionIdx]
  }

  // ------------------------- Actions ---------------------------
  @action
  async loadQuestionnaire(qstrId) {
    try {
      const resp = await Api.getQuestionnaire(qstrId)

      this.questionnaire = resp.data
      this.questionnaireErr = ''

      return true
    } catch (err) {
      this.questionnaireErr = err.response.data.message
    }

    return false
  }

  @action
  async startRun(qstrId) {
    try {
      const resp = await Api.postRun(qstrId)

      this.run = resp.data
      this.questionnaireErr = ''

      return true
    } catch (err) {
      this.questionnaireErr = err.response.data.message
    }

    return false
  }

  @action
  async loadNextQuestion() {
    if (!this.run)
      throw new Error('Before loading questions you need to start a new run')

    // If the question has already been loaded, use it from memory
    if (this.questions.length > this.curQuestionIdx + 1) {
      this.curQuestionIdx++

      return true
    }

    // Load next question from server
    try {
      const qId = this.curQuestion && this.curQuestion.id
      const resp = await Api.getNextQuestion(this.run.qstrId, qId)

      this.questions.push(resp.data)
      this.userAnswers.push({
        qId,
        choices: [0, 0, 0]
      })
      this.curQuestionIdx++
      this.questionnaireErr = ''

      return true
    } catch (err) {
      if (err.response) {
        // We reached the last question. Test finished
        if (err.response.status === 410) {
          this.isLastQuestionReached = true
        } else {
          this.questionnaireErr = err.response.data.message
        }
      } else {
        console.error(err)
      }
    }

    return false
  }

  @action
  async answerCurQuestion() {
    if (!this.run)
      throw new Error('Before loading questions you need to start a new run')

    try {
      let resp

      // If we are answering the last loaded question
      if (this.userAnswers.length === this.curQuestionIdx + 1) {
        const postBody = {
          qId: this.curQuestion.id,
          choices: this.curUserAnswer.choices,
        }

        resp = await Api.postAnswer(this.run.qstrId, this.run.id, postBody)
      } else {
        const putBody = {
          choices: this.curUserAnswer.choices,
        }

        resp = await Api.putAnswer(this.run.qstrId, this.run.id, this.curQuestion.id, putBody)
      }

      // Update the current answer with the server data
      this.userAnswers[this.curQuestionIdx] = resp.data
      this.questionnaireErr = ''

      return true
    } catch (err) {
      if (err.response) {
        if (err.response.status === 412) {
          this.questionnaireErr = 'Wrong answers. Please, select a "Most Suitable" and a "Less Suitable" answers'
        } else {
          this.questionnaireErr = err.response.data.message
        }
      } else {
        console.error(err)
      }
    }

    return false
  }

  @action
  goToPrevQuestion() {
    if (this.curQuestionIdx > 0)
      this.curQuestionIdx--
  }

  @action
  async loadRunResults() {
    if (!this.run || !this.isLastQuestionReached)
      throw new Error('Before loading the run results, you need to start a new run and finish the test')

    try {
      const resp = await Api.getRun(this.run.qstrId, this.run.id)

      this.run = resp.data
      this.questionnaireErr = ''

      return true
    } catch (err) {
      console.error(err)
    }

    return false
  }
}

export default AppState
