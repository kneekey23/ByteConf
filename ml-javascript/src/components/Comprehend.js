import React, {Component} from 'react'
var AWS = require('aws-sdk');
AWS.config.region = 'us-east-1'; 
AWS.config.credentials = new AWS.CognitoIdentityCredentials({IdentityPoolId: 'us-east-1:1956382a-b3f6-472c-9a8d-3a246853c917'});

class Comprehend extends Component {
    constructor(props){
        super(props);

        this.state = {
            text: '',
            resultMessage: '',
            resultSentiment: ''
        }
        this.onChangeText = this.onChangeText.bind(this);
        this.sendTextToComprehend = this.sendTextToComprehend.bind(this);
    }

    onChangeText(e){
        this.setState({text: e.target.value});
    }

    sendTextToComprehend = () => {
        // API call params
        var comprehendParams = {
            LanguageCode: "en",
            Text: ""
        };
        comprehendParams.Text = this.state.text;
        
        // instantiate comprehend client
        var comprehend = new AWS.Comprehend({apiVersion: '2017-11-27'});
        
        comprehend.detectSentiment(comprehendParams, function (err, data){
            if (err) {
                currentComponent.setState({resultMessage: err.message});
            }
            else {
                currentComponent.setState({resultSentiment: data.Sentiment});
                currentComponent.setState({resultMessage: "Text analyzed!"})
            }
        });

        // API call
        let currentComponent = this;
        
        comprehend.getResponse = () => {
            
            currentComponent.setState({resultMessage: "ANALYSIS HERE"});
        };

    }


    render() {
        let result;
        if(this.state.resultMessage !== ''){
          result = <p>{this.state.resultMessage}</p>
        }
        return (
          <div className="App">
             <div className="container">
              <h1>Amazon Comprehend</h1>
              <div className="row">
                <div className="col-md-6">
                  <form>
                      <div className="form-group">
                      
                          <input type="text" className="form-control" value={this.state.text} onChange={this.onChangeText} placeholder="Enter the text for Comprehend to analyze!"/>
                      </div>
                      <button type="button" className="btn btn-success" onClick={this.sendTextToComprehend}>Analyze text with Comprehend</button>
                    </form>
                  </div>
                  <div className="col-md-6">
                {result}
                </div>
                </div>
              </div>
          </div>
        );
      }
}
export default Comprehend;