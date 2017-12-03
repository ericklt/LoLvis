import React from 'react'
import { Switch, Route } from 'react-router-dom'
import Home from './home'
import Champions from './components/champions'
import Champion from './components/champion'

const Main = () => (
  <main>
    <Switch>
      <Route exact path='/' component={Home}/>
      <Route exact path='/champions' component={Champions}/>
      <Route path='/champions/:name'component={Champion}/>
    </Switch>
  </main>
)

export default Main