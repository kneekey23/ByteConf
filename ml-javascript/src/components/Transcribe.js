import React, {Component} from 'react';
import RecorderJS from 'recorder-js';
import { getAudioStream, exportBuffer } from '../utilities/audio';
var AWS = require('aws-sdk');
AWS.config.region = 'us-east-1'; 
AWS.config.credentials = new AWS.CognitoIdentityCredentials({IdentityPoolId: 'us-east-1:1956382a-b3f6-472c-9a8d-3a246853c917'});



class Transcribe extends Component {
    constructor(props){
        super(props);
        this.state = {
            stream: null,
            recording: false,
            recorder: null
        }
        this.startRecord = this.startRecord.bind(this);
        this.stopRecord = this.stopRecord.bind(this);
       
    }

    async componentDidMount() {
        let stream;
    
        try {
          stream = await getAudioStream();
        } catch (error) {
          // Users browser doesn't support audio.
          // Add your handler here.
          console.log(error);
        }
    
        this.setState({ stream });
      }
   
      startRecord() {
        const { stream } = this.state;
    
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const recorder = new RecorderJS(audioContext);
        recorder.init(stream);
    
        this.setState(
          {
            recorder,
            recording: true
          },
          () => {
            recorder.start();
          }
        );
      }
     
      async stopRecord() {
        const { recorder } = this.state;
    
        const { buffer } = await recorder.stop()
        const audio = exportBuffer(buffer[0]);
    
        // Process the audio here.
        console.log(audio);
    
        this.setState({
          recording: false
        });

        var transcribeservice = new AWS.TranscribeService({apiVersion: '2017-10-26'});
        var params = {
            LanguageCode: "en-US", /* required */
            Media: { /* required */
              MediaFileUri: 'STRING_VALUE'
            },
            MediaFormat: "wav", /* required */
            TranscriptionJobName: 'BYTECONF_1', /* required */
            MediaSampleRateHertz: 0
          };
          transcribeservice.startTranscriptionJob(params, function(err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else{
                console.log(data.size); 
            }          // successful response
          });
      }

    render() {
        const { recording, stream } = this.state;

        // Don't show record button if their browser doesn't support it.
        if (!stream) {
        return null;
        }
        return (
        <div className="container">
         <h1>Hello, ByteConf!</h1>
        <div className="row">
        <button
        onClick={() => {
          recording ? this.stopRecord() : this.startRecord();
        }}
        >
        {recording ? 'Stop Recording' : 'Start Recording'}
      </button>
        </div>
        </div>)
    }
}

export default Transcribe;