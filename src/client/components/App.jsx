import React, { Component } from 'react'
import { observer, inject } from 'mobx-react'
import DevTools from 'mobx-react-devtools'
import { BrowserRouter as Router, Route, Switch, browserHistory } from 'react-router-dom'

import Header from './Header'
import Home from './Home'
import Questionnaire from './Questionnaire'
import NotFound from './NotFound'

@observer
class App extends Component {

  render () {
    return(
      <Router history={browserHistory}>
        <div>
          {/* Static Header */}
          <Header />

          {/* App Routes */}
          <Switch>
            <Route exact path="/" component={Home} />
            <Route path="/questionnaire/:qstrId" component={Questionnaire} />
            <Route path="*" component={NotFound} />
          </Switch>

          {/* Debug/Development */}
          <DevTools/>
        </div>
      </Router>
    )
  }
}

export default App
