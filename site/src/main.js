import React from 'react'
import { Switch, Route } from 'react-router-dom'
import Home from './home'
import Champions from './components/champions'
import Champion from './components/champion'
import DeathMap from './components/death_map'
import Classification from './components/classification'

const Main = () => (
  <main>
    <Switch>
      <Route exact path='/' component={Home}/>
      <Route exact path='/champions' component={Champions}/>
      <Route exact path='/map' component={DeathMap}/>
      <Route path='/champions/:name'component={Champion}/>
      <Route exact path='/classification' component={Classification}/>
    </Switch>
  </main>
)

export default Main
