const questionnaireCtrl = require('./controllers/questionnaireCtrl');
const runCtrl = require('./controllers/runCtrl');

const apiPrefix = '/api'

module.exports.enpoints = [
  // Questionnaire
  { method: 'GET', path: `${apiPrefix}/questionnaires/{qstrId}`, config: questionnaireCtrl.get },
  { method: 'GET', path: `${apiPrefix}/questionnaires/{qstrId}/questions/{qId}/next`, config: questionnaireCtrl.getNextQuestion },

  // Runs
  { method: 'POST', path: `${apiPrefix}/questionnaires/{qstrId}/runs`, config: runCtrl.post },
  { method: 'GET', path: `${apiPrefix}/questionnaires/{qstrId}/runs/{runId}`, config: runCtrl.get },
  { method: 'POST', path: `${apiPrefix}/questionnaires/{qstrId}/runs/{runId}/answers`, config: runCtrl.postAnswer },
  { method: 'PUT', path: `${apiPrefix}/questionnaires/{qstrId}/runs/{runId}/answers/{answerId}`, config: runCtrl.putAnswer },
]

module.exports.apiPrefix = apiPrefix
