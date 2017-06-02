import axios from 'axios'

const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:8000'
const apiPrefix = '/api'
const apiUrl = `${apiBaseUrl}${apiPrefix}`

const routes = {
  getQuestionnaire: qstrId => `${apiUrl}/questionnaires/${qstrId}`,
  getNextQuestion: (qstrId, qId) => `${apiUrl}/questionnaires/${qstrId}/questions/${qId}/next`,
  postRun: qstrId => `${apiUrl}/questionnaires/${qstrId}/runs`,
  getRun: (qstrId, runId) => `${apiUrl}/questionnaires/${qstrId}/runs/${runId}`,
  postAnswer: (qstrId, runId) => `${apiUrl}/questionnaires/${qstrId}/runs/${runId}/answers`,
  putAnswer: (qstrId, runId, answerId) => `${apiUrl}/questionnaires/${qstrId}/runs/${runId}/answers/${answerId}`
}

export const addInterceptors = (appState) => {
  axios.interceptors.request.use(
    (config) => {
      if (appState.run) {
        config.headers['x-run-id'] = appState.run.id // Always sent if we have an active Run
      }

      return config
    }
  )
}

export const getQuestionnaire = (qstrId) => {
  return axios.get(routes.getQuestionnaire(qstrId))
}

export const postRun = (qstrId) => {
  return axios.post(routes.postRun(qstrId))
}

export const getRun = (qstrId, runId) => {
  return axios.get(routes.getRun(qstrId, runId))
}

export const getNextQuestion = (qstrId, qId) => {
  return axios.get(routes.getNextQuestion(qstrId, qId))
}

export const postAnswer = (qstrId, runId, reqBody) => {
  return axios.post(routes.postAnswer(qstrId, runId), reqBody)
}

export const putAnswer = (qstrId, runId, answerId, reqBody) => {
  return axios.put(routes.putAnswer(qstrId, runId, answerId), reqBody)
}
