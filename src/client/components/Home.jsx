import React from 'react'
import { Link } from 'react-router-dom'

const randWelcome = () => {
  const messages = [
    'Welcome my friend!',
    'Bienvenido Amigo!',
    'Bonvenigas mia amiko!',
    'welkom Mijn vriend!'
  ]

  return messages[Math.floor(Math.random() * messages.length)]
}

const Home = () => (
  <div>
    <h3>{randWelcome()}</h3>
    <h4>Press start when ready</h4>

    <Link to={'/questionnaire/1'}>
      <button>Start</button>
    </Link>
  </div>
)

export default Home

