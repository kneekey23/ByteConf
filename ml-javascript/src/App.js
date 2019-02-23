import React, { Component } from 'react';
import './App.css';
import { Switch, Route } from 'react-router-dom'
import Polly from './components/Polly';
import Transcribe from './components/Transcribe';


class App extends Component {
constructor(props){
  super(props);

}

  render() {
    return (<Switch>
      <Route exact path='/polly' component={Polly}/>
      <Route path='/transcribe' component={Transcribe}/>
    </Switch>
    )
  }
}

export default App;
