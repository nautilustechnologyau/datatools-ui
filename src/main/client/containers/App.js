import React from 'react'
import { connect } from 'react-redux'
import { Router, Route, Redirect } from 'react-router'

import NoAccessScreen from '../components/NoAccessScreen'
import ActiveProjectsList from '../containers/ActiveProjectsList'
import ActiveProjectViewer from '../containers/ActiveProjectViewer'
import ActiveFeedSourceViewer from '../containers/ActiveFeedSourceViewer'
import ActivePublicFeedsViewer from '../containers/ActivePublicFeedsViewer'
import ActiveUserAccount from '../containers/ActiveUserAccount'
import ActiveSignupPage from '../containers/ActiveSignupPage'


import { checkExistingLogin, userLoggedIn } from '../actions/user'
import { fetchConfig } from '../actions/config'

import { UserIsAuthenticated } from '../util/util'

class App extends React.Component {

  constructor (props) {
    super(props)

    this.props.fetchConfig().then(() => {
      return this.props.checkExistingLogin()
    })
  }
  // componentDidMount () {
  //   this.props.fetchConfig().then(() => {
  //     return this.props.checkExistingLogin()
  //   })
  // }
  render () {
    // const requireAuth = (nextState, replace, callback) => {
    //   this.props.fetchConfig().then(() => {
    //     return this.props.checkExistingLogin(callback)
    //   })
    //   console.log(nextState)
    //   console.log('props', this.props)
    //   if (
    //     this.props.config.title &&
    //     this.props.user.profile === null) {
    //     replace({
    //       pathname: '/explore',
    //       state: { nextPathname: nextState.location.pathname }
    //     })
    //   }
    // }

    let canAccess = false, noAccessReason
    if(this.props.user.profile === null) {
      noAccessReason = 'NOT_LOGGED_ID'
    }
    else {
      canAccess = true
    }
    return (
      <Router history={this.props.history}>
        <Redirect from='/' to='explore' />
        <Route path='/account' component={UserIsAuthenticated(ActiveUserAccount)} />
        <Route path='/signup' component={ActiveSignupPage} />
        <Route path='/explore' component={ActivePublicFeedsViewer} />
        <Route path='/project' component={UserIsAuthenticated(ActiveProjectsList)} />
        <Route path='/project/:projectId' component={UserIsAuthenticated(ActiveProjectViewer)} />
        <Route path='/feed/:feedSourceId' component={ActiveFeedSourceViewer} />
      </Router>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    user: state.user,
    config: state.config
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    fetchConfig: () => dispatch(fetchConfig()),
    checkExistingLogin: () => dispatch(checkExistingLogin())
  }
}

App = connect(
  mapStateToProps,
  mapDispatchToProps
)(App)

export default App
