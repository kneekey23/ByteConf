import React, {Component} from 'react'
import {Predictions } from 'aws-amplify';

class Comprehend extends Component {
    constructor(props){
        super(props);

        this.state = {
            text: '',
            resultMessage: '',
            resultSentiment: '',
            resultSentimentScore: ''
        }
        this.onChangeText = this.onChangeText.bind(this);
        this.sendTextToComprehend = this.sendTextToComprehend.bind(this);
    }

    onChangeText(e){
        this.setState({text: e.target.value});
    }

    sendTextToComprehend = () => {


      Predictions.interpret({
        text: {
          source: {
            text: this.state.text
          },
          type: "LANGUAGE"
        }
      }).then(result => {
        console.log(result);
        this.setState({resultMessage: "Text analyzed!"})
        this.setState({resultSentiment: result.textInterpretation.sentiment.predominant});
        //this.setState({resultSentimentScore: JSON.stringify(result.SentimentScore)});

      })
        .catch(err => {
          this.setState({resultMessage: err.message});
          this.setState({resultSentiment: ""})
          this.setState({resultSentimentScore: ""});
        })

    }


    render() {
        let result, response, score;
        if(this.state.resultMessage !== ''){
          result = <p>{this.state.resultMessage}</p>
          response = <p>{this.state.resultSentiment}</p> 
          score = <pre>{this.state.resultSentimentScore}</pre>
        }
        return (
          <div className="App">
             <div className="container">
              <h1>Amazon Comprehend</h1>
              <div className="row">
                <div className="col-md-6">
                  <form>
                      <div className="form-group">
                          <textarea className="form-control" rows="5" value={this.state.text} onChange={this.onChangeText} placeholder="Enter the text for Comprehend to analyze!"/>
                      </div>
                      <button type="button" className="btn btn-success" onClick={this.sendTextToComprehend}>Analyze text with Comprehend</button>
                    </form>
                  </div>
                  <div className="col-md-6">
                {result}
                {response}
                {score}
                </div>
                </div>
              </div>
          </div>
        );
      }
}
export default Comprehend;