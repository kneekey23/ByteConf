import React, {Component} from 'react';
import mic from 'microphone-stream';
import { getAudioStream } from '../utilities/audio';
import '../App.css';
import {Predictions } from 'aws-amplify';

class Transcribe extends Component {
    constructor(props){
        super(props);
        this.state = {
            stream: null,
            recording: false,
            micStream: null,
            transcription:'',
            transcriptionJobComplete: true,
            audioBuffer: null
        }
        this.startRecord = this.startRecord.bind(this);
        this.stopRecord = this.stopRecord.bind(this);
        this.getTranscription = this.getTranscription.bind(this);       
    }

    async componentDidMount() {
        let stream;
    
        try {
          stream = await getAudioStream();
        } catch (error) {
          // Users browser doesn't support audio.
          console.log(error);
        }
        this.setState({ stream });
      }
   
    startRecord() {
      var buffer = []
      console.log('start recording');
    
      window.navigator.mediaDevices.getUserMedia({ video: false, audio: true }).then((stream) => {
        const startMic = new mic();

        startMic.setStream(stream);

        startMic.on('data', (chunk) => {
          var raw = mic.toRaw(chunk);
          if (raw == null) {
            return;
          }

        buffer = buffer.concat(...raw)
        this.setState({audioBuffer: buffer})
      });

      this.setState({recording: true})
      this.setState({micStream: startMic})
    })

    }
     
    async stopRecord() {
      console.log('stop recording');
      
      const { micStream }  = this.state
      micStream.stop();

      this.setState({setMicStream: null})
      this.setState({recording: false});

      this.getTranscription();
    }

    getTranscription() {
        this.setState({transcriptionJobComplete: false});
        let bytes = this.state.audioBuffer
        Predictions.convert({
          transcription: {
            source: {
              bytes
            },
            // language: "en-US", // other options are "en-GB", "fr-FR", "fr-CA", "es-US"
          },
        })
        .then(result => {
          console.log(result.transcription.fullText)
          this.setState({transcriptionJobComplete: true});

          this.setState({transcription: result.transcription.fullText})
        })
        .catch(err => console.log(JSON.stringify(err, null, 2)))       
    }

    render() {
        const { recording, stream } = this.state;
        let transcribeBtn;
        if(this.state.transcriptionJobComplete){
          transcribeBtn =  <button className="btn btn-primary" onClick={this.getTranscription}>Get Transcription</button>
        }
        else{
          transcribeBtn = <button className="btn btn-primary" type="button" disabled>
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            <span className="sr-only">Transcribing...</span>
                          </button>
        }
        
        // Don't show record button if their browser doesn't support it.
        if (!stream) {
        return null;
        }
        return (
        <div className="container">
         <h1>Amazon Transcribe</h1>
            <div className="col-xs-12">
                <div className="row">
                  <div className="col-xs-2 step">
                    <h3 className="stepTitle">Step 1</h3>
                    <button
                    className={recording? 'btn btn-danger' : 'btn btn-success'}
                    onClick={() => {
                    recording ? this.stopRecord() : this.startRecord();
                    }}
                    >
                    {recording ? 'Stop Recording' : 'Start Recording'}
                    </button>
                    <h4 className="stepInstructions">Record something to transcribe</h4>
                    </div>
                  <div className="col-xs-2 step">
                    <h3 className="stepTitle">Step 2</h3>
                    {transcribeBtn}
                    
                    <h4 className="stepInstructions">Get the transcription!</h4>
                  </div>
                </div>
                <div className="row">
                    <div className="col-xs-12 step">
                    <h4>Transcription Result: {this.state.transcription}</h4>
                    </div>
                </div>

            </div>
        </div>)
    }
}

export default Transcribe;