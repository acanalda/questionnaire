const Joi = require('joi')

const questionSchema = {
  id: Joi.string(),
  title: Joi.string(),
  answers: {
    title: Joi.string(),
  }
}

// method:'GET', path:'/questionnaires/{qstrId}'
exports.get = {
  params: {
    qstrId: Joi.string(),
  }
}
exports.getResponse = {
  schema: {
    id: Joi.string(),
    title: Joi.string(),
    description: Joi.string(),
    // Notice no questions + answers will be returned
  },
  modify: true,
  options: {
    stripUnknown: true
  }
}

// method:'GET', path:'/questionnaires/{qstrId}/questions/{qId}/nxt'
exports.getNextQuestion = {
  params: {
    qstrId: Joi.string(),
    qId: Joi.string(),
  }
}
exports.getNextQuestionResponse = {
  schema: questionSchema,
  modify: true,
  options: {
    stripUnknown: true
  }
}

