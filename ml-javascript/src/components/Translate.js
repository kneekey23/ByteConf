import React, {Component} from 'react'

import {Predictions } from 'aws-amplify';

class Translate extends Component {
    constructor(props){
        super(props);

        this.state = {
            text: '',
            resultMessage: '',
            resultTranslation: ''
        }
        this.onChangeText = this.onChangeText.bind(this);
        this.sendTextToTranslate = this.sendTextToTranslate.bind(this);
    }

    onChangeText(e){
        this.setState({text: e.target.value});
    }

    sendTextToTranslate = () => {


      Predictions.convert({
        translateText: {
          source: {
            text: this.state.text
            // language : "es" // defaults configured on aws-exports.js
            // supported languages https://docs.aws.amazon.com/translate/latest/dg/how-it-works.html#how-it-works-language-codes
          },
          // targetLanguage: "en"
        }
      }).then(result => {
        console.log(result);
          this.setState({resultTranslation: result.text});
          this.setState({resultMessage: "Text translation successful!"})
      })
        .catch(err => {
          this.setState({resultMessage: err.message});
        })
    }


    render() {
        let result, translation;
        if(this.state.resultMessage !== ''){
          result = <p>{this.state.resultMessage}</p>
          translation = <p>{this.state.resultTranslation}</p>
        }
        return (
          <div className="App">
             <div className="container">
              <h1>Amazon Translate</h1>
              <div className="row">
                <div className="col-md-6">
                  <form>
                      <div className="form-group">
                          <input type="text" className="form-control" value={this.state.text} onChange={this.onChangeText} placeholder="Enter the text for Translate to analyze!"/>
                      </div>
                      <button type="button" className="btn btn-success" onClick={this.sendTextToTranslate}>Translate text with Translate!</button>
                    </form>
                  </div>
                  <div className="col-md-6">
                {result}
                {translation}
                </div>
                </div>
              </div>
          </div>
        );
      }
}
export default Translate;