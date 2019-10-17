import React, {Component} from 'react';
import ReactAudioPlayer from 'react-audio-player';
import {Predictions } from 'aws-amplify';

class Polly extends Component {
    constructor(props){
        super(props);
      
        this.state = {
          text: '',
          resultMessage: '',
          pollyUrl: ''
        }
        this.onChangeText = this.onChangeText.bind(this);
        this.sendTextToPolly = this.sendTextToPolly.bind(this);
      }
      
      onChangeText(e){
      
        this.setState({text: e.target.value});
        
      }
      
      sendTextToPolly = () => {

          Predictions.convert({
            textToSpeech: {
              source: {
                text: this.state.text
              },
              voiceId: "Nicole" // default configured on aws-exports.js 
              // list of different options are here https://docs.aws.amazon.com/polly/latest/dg/voicelist.html
            }
          })
          .then(result => {

            this.setState({pollyUrl: result.speech.url});
           
            this.setState({resultMessage: "Speech ready to play"});
          })
          .catch(err => {
              console.log(JSON.stringify(err, null, 2));
              this.setState({resultMessage: err.message});
          })
      }
      
        render() {
          let result;
          if(this.state.resultMessage !== ''){
            result = <p>{this.state.resultMessage}</p>
          }
          return (
            <div className="App">
               <div className="container">
                <h1>Amazon Polly</h1>
                <div className="row">
                  <div className="col-md-6">
                    <form>
                        <div className="form-group">
                        
                            <input type="text" className="form-control" value={this.state.text} onChange={this.onChangeText} placeholder="Enter the text you would like Polly to say"/>
                        </div>
                        <button type="button" className="btn btn-success" onClick={this.sendTextToPolly}>Voice My Message Using Polly</button>
                      </form>
                    </div>
                    <div className="col-md-6">
                     
                    <ReactAudioPlayer
                    src={this.state.pollyUrl}
                    autoPlay
                    controls
                  />
                  {result}
                  </div>
                  </div>
                </div>
            </div>
          );
        }
      
}

export default Polly;