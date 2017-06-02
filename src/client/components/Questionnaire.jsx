import React, { Component } from 'react'
import { toJS } from 'mobx'
import { observer, inject } from 'mobx-react'
import { Link } from 'react-router-dom'

// --------------------- Components ---------------------
const QuestionnaireIntro = ({ appState, onStartRun }) => (
  <div>
    <h3>{appState.questionnaire.title}</h3>
    <p>{appState.questionnaire.description}</p>
    <Link to={`/questionnaire/${appState.questionnaire.id}`}>
      <button onClick={onStartRun}>Click here to start the Test!!</button>
    </Link>
  </div>
)

const Question = ({ questionIdx, question, userAnswer, onChoiceSelect, onPrevQuestion, onNextQuestion }) => (
  <div>
    {/* Question title */}
    <h3>{question.title}</h3>

    {/* Radio Buttons Menu */}
    <table width='100%'>
      {/* Table Header */}
      <thead>
        <tr>
          <th></th>
          <th>Most Suitable</th>
          <th>Less Suitable</th>
        </tr>
      </thead>

      {/* Table Body */}
      <tbody>
      {
        /* Render all the answers */
        question.answers.map((answer, index) =>
          (
            <tr key={index}>
              <td>{answer.title}</td>
              <td><input type='radio' name='most' value={index}
                checked={userAnswer.choices[index]===1} onChange={onChoiceSelect} /></td>
              <td><input type='radio' name='less' value={index}
                checked={userAnswer.choices[index]===-1} onChange={onChoiceSelect} /></td>
            </tr>
          )
        )
      }
      </tbody>
    </table>

    {/* Questionnaire Navigation */}
    <p>
      {
        questionIdx > 0 && <button onClick={onPrevQuestion}>Load previous question</button>
      }
      <button onClick={onNextQuestion}>Load next question</button>
    </p>
  </div>
)

const QuestionnaireEnd = ({ appState }) => (
  <div>
    <h2>Test is over!</h2>
    <h3>Partial scores</h3>
    {
      appState.run.userAnswers.map((userAnswer, index) => (
        <div>Question {index+1}: <span>{userAnswer.score}</span></div>
      ))
    }
    <h3>Final Score: {appState.run.totalScore}</h3>
    { appState.run.totalScore < 0 && <h3>Sorry, but you need to practice more</h3> }
    { appState.run.totalScore > 0 && <h3>That's not a bad score!</h3> }
  </div>
)

// --------------------- Container ---------------------
@inject('appState')
@observer
class Questionnaire extends Component {
  constructor(props) {
    super(props)
    const { appState, match} = this.props

    // Just to access to it easily
    this.qstrId = match.params.qstrId

    appState.loadQuestionnaire(this.qstrId)
  }

  // --------------------- Handle methods ---------------------
  handleStartRun = async () => {
    const { appState } = this.props

    if(await appState.startRun(this.qstrId)) {
      appState.loadNextQuestion()
    }
  }

  handleChoiceSelect = (evt) => {
    const { appState } = this.props
    const choices = appState.curUserAnswer.choices
    const selIndex = evt.currentTarget.value
    const selGroup = evt.currentTarget.name
    const nextVal = selGroup === 'most' ? 1 : -1

    // Swap existing 1 or -1 with 0
    choices[choices.indexOf(nextVal)] = 0

    // Set the selected value
    choices[selIndex] = nextVal

    // Force rerender
    this.setState({})
  }

  handleLoadPrevQuestion = async () => {
    const { appState } = this.props

    appState.goToPrevQuestion()
  }

  handleLoadNextQuestion = async () => {
    const { appState } = this.props

    // If anwser was valid, load next question
    if(await appState.answerCurQuestion()) {
      await appState.loadNextQuestion()

      // Once we reach the last question, load run final results
      if (appState.isLastQuestionReached) {
        await appState.loadRunResults()
      }
    }
  }

  // --------------------- Renderer ---------------------
  render () {
    const { appState } = this.props

    return (
      <div>
        {/* Questionnaire Intro */
          appState.questionnaire && !appState.run &&
          <QuestionnaireIntro appState={appState} onStartRun={this.handleStartRun}/>
        }

        {/* Current Question */
          appState.run && !appState.run.finished && appState.curQuestion &&
          <Question
            questionIdx={appState.curQuestionIdx}
            question={appState.curQuestion}
            userAnswer={appState.curUserAnswer}
            onChoiceSelect={this.handleChoiceSelect}
            onPrevQuestion={this.handleLoadPrevQuestion}
            onNextQuestion={this.handleLoadNextQuestion}
          />
        }

        {/* Test over */
          appState.run && appState.run.finished &&
          <QuestionnaireEnd appState={appState} />
        }

        {/* Questionnaire Error */
          appState.questionnaireErr && <div><em>{appState.questionnaireErr}</em></div>
        }
      </div>
    )
  }
}

export default Questionnaire

