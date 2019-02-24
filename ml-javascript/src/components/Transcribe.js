import React, {Component} from 'react';
import RecorderJS from 'recorder-js';
import { getAudioStream, exportBuffer } from '../utilities/audio';
import TranscribeService from "aws-sdk/clients/transcribeservice";
import S3Service from "aws-sdk/clients/s3";
// var AWS = require('aws-sdk');
// AWS.config.region = 'us-east-1'; 
// AWS.config.credentials = new AWS.CognitoIdentityCredentials({IdentityPoolId: 'us-east-1:1956382a-b3f6-472c-9a8d-3a246853c917'});



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
    
        this.setState({recording: false});
         //send audio file to s3 bucket to prepare for transcription
        var s3 = new S3Service();
        s3.config.region = "us-west-2";
        var params = {
            ACL: "authenticated-read",
            Body: audio, 
            Bucket: "transcribe-test-js", 
            Key: "test.wav"
           };

           s3.putObject(params, function(err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else     console.log(data);           // successful response
            /*
            data = {
             ETag: "\"6805f2cfc46c0f04559748bb039d69ae\"", 
             VersionId: "psM2sYY4.o1501dSx8wMvnkOzSBB.V4a"
            }
            */
          });

       


       
    //    var transcribeservice = new TranscribeService();
    //     var params = {
    //         LanguageCode: "en-US", /* required */
    //         Media: { /* required */
    //           MediaFileUri: 'STRING_VALUE'
    //         },
    //         MediaFormat: "wav", /* required */
    //         TranscriptionJobName: 'BYTECONF_1', /* required */
    //         MediaSampleRateHertz: 16000
    //       };
    //       transcribeservice.startTranscriptionJob(params, function(err, data) {
    //         if (err) console.log(err, err.stack); // an error occurred
    //         else{
    //             console.log(data.size); 
    //         }          // successful response
    //       });
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