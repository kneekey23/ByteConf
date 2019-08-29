import React, { Component } from 'react';
import './App.css';
import { Switch, Route } from 'react-router-dom'
import Polly from './components/Polly';
import Transcribe from './components/Transcribe';
import Main from './components/Main';
import Comprehend from './components/Comprehend';
import Rekognition from './components/Rekognition';
import Translate from './components/Translate';
import Amplify from '@aws-amplify/core';
import { AmazonAIPredictionsProvider } from '@aws-amplify/predictions';
import awsconfig from './aws-exports';

Amplify.configure(awsconfig);
Amplify.addPluggable(new AmazonAIPredictionsProvider());


class App extends Component {

  render() {
    return (<Switch>
      <Route exact path='/' component={Main} />
      <Route path='/polly' component={Polly}/>
      <Route path='/transcribe' component={Transcribe}/>
      <Route path='/comprehend' component={Comprehend}/>
      <Route path='/rekognition' component={Rekognition} />
      <Route path='/translate' component={Translate} />
    </Switch>
    )
  }
}

export default App;
