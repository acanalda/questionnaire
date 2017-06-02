import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'mobx-react'
import { BrowserRouter as Router } from 'react-router-dom'
import { AppContainer } from 'react-hot-loader'

import AppState from './stores/AppState'
import App from './components/App'

// Create store
const appState = new AppState()

const render = Component => {
  ReactDOM.render(
    <AppContainer>
      <Router>
        <Provider appState={appState}>
          <Component/>
        </Provider>
      </Router>
    </AppContainer>,
    document.getElementById('root')
  )
}

// Render App
render(App)

// Hot Reload
if (module.hot) {
  module.hot.accept('./components/App', () => { render(NextApp) })
}
