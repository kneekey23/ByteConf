import React, {Component} from 'react';
import RecorderJS from 'recorder-js';
import ReactAudioPlayer from 'react-audio-player';
import { getAudioStream, exportBuffer } from '../utilities/audio';
import TranscribeService from "aws-sdk/clients/transcribeservice";
import S3Service from "aws-sdk/clients/s3";

var transcribeservice = new TranscribeService();
var s3 = new S3Service();
s3.config.region = "us-east-1";

class Transcribe extends Component {
    constructor(props){
        super(props);
        this.state = {
            stream: null,
            recording: false,
            recorder: null,
            transcriptionJobName: '',
            transcription:'',
            s3URL:''
        }
        this.startRecord = this.startRecord.bind(this);
        this.stopRecord = this.stopRecord.bind(this);
        this.transcribeAudio = this.transcribeAudio.bind(this);
        this.getTranscription = this.getTranscription.bind(this);
       
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
       
        let currentComponent = this;
        var params = {
            ACL: "public-read",
            Body: audio, 
            Bucket: "transcribe-output-js", 
            Key: "test.wav"
           };
     
        s3.putObject(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else{
            currentComponent.setState({s3URL: "https://s3.amazonaws.com/transcribe-output-js/" + params.Key})
            console.log(data); // successful response
            currentComponent.transcribeAudio();
        }          

        });     
      }

    transcribeAudio() {
       
        let job = Math.random();
        this.setState({transcriptionJobName: 'BYTECONF_' + job});
        var params = {
            LanguageCode: "en-US", /* required */
            Media: { /* required */
                MediaFileUri: this.state.s3URL
            },
            MediaFormat: "wav", /* required */
            TranscriptionJobName: this.state.transcriptionJobName,
            OutputBucketName: "transcribe-output-js"
            };
            transcribeservice.startTranscriptionJob(params, function(err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else{
                console.log(data);  // successful response
            }         
        });
    }

   givePublicAccessToTranscriptObject(key) {

    return new Promise((resolve, reject) => {
      var params = { 
        ACL: 'public-read',
        Bucket: "transcribe-output-js",
        Key: key
       };
      s3.putObjectAcl(params, function(err, data) {
         if (err){ 
           console.log(err, err.stack);
           reject(err);
         }// an error occurred
         else{ // successful response
          console.log(data);  
          console.log("public access updated");
           resolve(data);
                   
         }     

       });
    })
      
    }

    getTranscription() {
   
        var currentComponent = this;
        var params = {
            TranscriptionJobName: this.state.transcriptionJobName /* required */
          };
         transcribeservice.getTranscriptionJob(params, function(err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else{    // successful response
                console.log(data);
                if(data.TranscriptionJob.TranscriptionJobStatus === 'IN_PROGRESS'){
                  setTimeout(() => {
                    currentComponent.getTranscription();
                  }, 5000);
                }
                else if(data.TranscriptionJob.TranscriptionJobStatus === 'COMPLETED'){
                  let url = data.TranscriptionJob.Transcript.TranscriptFileUri
                  let key = url.replace('https://s3.amazonaws.com/transcribe-output-js/', '');
                  console.log(key);
                  currentComponent.givePublicAccessToTranscriptObject(key)
                    .then(data => {
                        //download data file
                        console.log("ready to download json file")
                        let parsedObject = {};

                        fetch(url)
                          .then(response => response.json())
                          .then(json => {
                            console.log(json.results.transcripts[0].transcript);
                            currentComponent.setState({transcription: json.results.transcripts[0].transcript})
                          
                          })
                          .catch(error => console.log(`Failed because: ${error}`));

                        console.log(parsedObject);
                    })
                   
                 
               }
            }           
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
            <div className="col-xs-12">
                <div className="row">
                  <div className="col-xs-6">
                    <button
                    className={recording? 'btn btn-danger' : 'btn btn-success'}
                    onClick={() => {
                    recording ? this.stopRecord() : this.startRecord();
                    }}
                    >
                    {recording ? 'Stop Recording' : 'Start Recording'}
                    </button>
                    <ReactAudioPlayer
                    src={this.state.s3URL}
                    autoPlay
                    controls
                  />
                  </div>
                  <div className="col-xs-6">
                  <button className="btn btn-info" onClick={this.getTranscription}>Get Transcription</button>
                 
                  </div>
                </div>
                <div className="row">
                    <div className="col-xs-12">
                    <h4>Transcription: {this.state.transcription}</h4>
                    </div>
                </div>

            </div>
        </div>)
    }
}

export default Transcribe;