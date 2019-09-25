import React, {Component} from 'react';
import { Form } from 'semantic-ui-react';
import Webcam from 'react-webcam';
import {Predictions } from 'aws-amplify';
var dataUriToBuffer = require('data-uri-to-buffer');

class Rekognition extends Component {
    constructor(props){
        super(props);

        this.state = {
            image: '',
            resultMessage: '',
            resultLabels: [],
            imageSrc: '',
      
        }
        this.handleCapture = this.handleCapture.bind(this);
        this.sendImageToRekognition = this.sendImageToRekognition.bind(this);
    }
    setRef = webcam => {
      this.webcam = webcam;
    };
  
    handleCapture=() => {

      const imageSrc = this.webcam.getScreenshot()
      this.sendImageToRekognition(imageSrc)
    }
    
    sendImageToRekognition = (imageSrc) => {
      
        // convert image to buffer from base64
        let buffer = dataUriToBuffer(imageSrc)
        let bytes = new Uint8Array(buffer);

        Predictions.identify({
          labels: {
          source: {
              bytes
          },
          type: "LABELS"
          }
      }).then(response => {
       
          const { labels } = response;

          this.setState({resultLabels: labels});
          this.setState({resultMessage: "Classification successful!"})

      }).catch(err => {
        this.setState({resultMessage: err.message});
      })
        
    }

    
    render(){
        let result, labels;
        if(this.state.resultMessage !== ''){
          result = <p>{this.state.resultMessage}</p>
          labels = this.state.resultLabels.map((object, i) => {
              return (<tr key={i}>
                        <td>
                          {object.name}
                        </td>
                        <td>
                          {object.metadata.confidence}
                        </td>
                    </tr>
              )
              
            })
          
        }
        const videoConstraints = {
          facingMode: "user"
        };
        return (
          <div className="App">
            <div className="container">
                <h1>Rekognition</h1>
                <p><code>detectLabels</code>: Detect object labels from an input image!</p>
                <div className="row">
                    <div className="col-md-8">
                        <Form>
                            <Webcam
                              audio={false}
                              height={350}
                              width={400}
                              ref={this.setRef}
                              screenshotFormat="image/png"
                              //screenshotWidth={IMAGE_WIDTH} // no sense capturing images in a resolution higher than what resnet wants
                              videoConstraints={videoConstraints}
                            />
                          <Form.Button onClick={this.handleCapture}>Detect Labels</Form.Button>
                        
                        </Form>
                    </div>
                    <div className="col-md-4">
                      <span>Results:</span>{result}
                      <table>
                        <thead>
                          <tr>
                            <th>
                              Object Name
                            </th>
                            <th>
                              Confidence
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                        {labels}
                        </tbody>
                      </table>
                    </div>
                </div>
            </div>
        </div>
        )
    }
}

export default Rekognition