const Joi = require('joi')

const runSchema = {
  id: Joi.string(),
  uuid: Joi.string(),
  totalScore: Joi.number(),
  finished: Joi.boolean(),
  userAnswers: Joi.array().items({
    id: Joi.string(),
    qId: Joi.string(),
    choices: Joi.array().items(Joi.number()),
    score: Joi.number(),
  })
}

// method:'POST', path:'/questionnaires/{qstrId}/runs'
exports.post = {
  params: {
    qstrId: Joi.string(),
  }
}
exports.postResponse = {
  schema: runSchema,
  modify: true,
  options: {
    stripUnknown: true
  }
}

// method:'GET', path:'/questionnaires/{qstrId}/runs/{runId}'
exports.get = {
  params: {
    qstrId: Joi.string(),
    runId: Joi.string(),
  }
}
exports.getResponse = {
  schema: runSchema,
  modify: true,
  options: {
    stripUnknown: true
  }
}

// method:'POST', path:'/questionnaires/{qstrId}/runs/{runId}/answers'
exports.postAnswer = {
  params: {
    qstrId: Joi.string(),
    runId: Joi.string(),
  },
  payload: {
    qId: Joi.string(),
    choices: Joi.array().items(Joi.number()),
  }
}
exports.postAnswerResponse = {
  schema: {
    id: Joi.string(),
    qId: Joi.string(),
    choices: Joi.array().items(Joi.number()),
  },
  modify: true,
  options: {
    stripUnknown: true
  }
}

// method:'PUT', path:'/questionnaires/{qstrId}/runs/{runId}/answers/{answerId}'
exports.putAnswer = {
  params: {
    qstrId: Joi.string(),
    runId: Joi.string(),
    answerId: Joi.string(),
  },
  payload: {
    choices: Joi.array().items(Joi.number()),
  }
}
exports.putAnswerResponse = {
  schema: {
    id: Joi.string(),
    qId: Joi.string(),
    choices: Joi.array().items(Joi.number()),
  },
  modify: true,
  options: {
    stripUnknown: true
  }
}
