const Questionnaire = require('../models/Questionnaire')
const mockStore = require('./mocks/questionnaires.json')

// Mock the store
console.log('Mocking questionnaires store')
Questionnaire.store = mockStore
