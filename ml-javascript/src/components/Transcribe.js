import React, {Component} from 'react';
import { ReactMic } from 'react-mic';
var AWS = require('aws-sdk');
AWS.config.region = 'us-east-1'; 
AWS.config.credentials = new AWS.CognitoIdentityCredentials({IdentityPoolId: 'us-east-1:1956382a-b3f6-472c-9a8d-3a246853c917'});


var transcribeservice = new AWS.TranscribeService({apiVersion: '2017-10-26'});

class Transcribe extends Component {
    constructor(props){
        super(props);
        this.state = {
            record: false
        }
       
    }

    startRecording = () => {
        this.setState({
          record: true
        });
      }
     
      stopRecording = () => {
        this.setState({
          record: false
        });
      }
     
      onData(recordedBlob) {
        console.log('chunk of real-time data is: ', recordedBlob);
      }
     
      onStop(recordedBlob) {
        console.log('recordedBlob is: ', recordedBlob);
      }

    render() {
        return (
        <div className="container">
         <h1>Hello, ByteConf!</h1>
        <div className="row">
        <ReactMic
          record={this.state.record}
          className="sound-wave"
          onStop={this.onStop}
          onData={this.onData}
          strokeColor="#000000"
          backgroundColor="#FF4081" />
        <button onClick={this.startRecording} type="button">Start</button>
        <button onClick={this.stopRecording} type="button">Stop</button>
        </div>
        </div>)
    }
}

export default Transcribe;