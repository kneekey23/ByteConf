import React, {Component} from 'react';
import { Form } from 'semantic-ui-react';
import Webcam from 'react-webcam';

var AWS = require('aws-sdk');
AWS.config.region = 'us-east-1'; 
AWS.config.credentials = new AWS.CognitoIdentityCredentials({IdentityPoolId: 'us-east-1:1956382a-b3f6-472c-9a8d-3a246853c917'});

class WebcamCapture extends Component {
    constructor(props) {
      super(props);
      this.state = {
          imageSrc: '',
          base64Image: ''
      }
    }
    setRef = webcam => {
      this.webcam = webcam;
    };
  
    handleCapture=() => {
      this.props.onCapture(this.webcam.getScreenshot())
      //this.imageSrc = this.webcam.getScreenshot();
      this.setState({ base64Image: this.webcam.getScreenshot() });
    }
    

    render() {
      const videoConstraints = {
        facingMode: "user"
      };
  
      return (
        <div>
          <div>
            <Webcam
              audio={false}
              height={350}
              width={400}
              ref={this.setRef}
              screenshotFormat="image/jpeg"
              //screenshotWidth={IMAGE_WIDTH} // no sense capturing images in a resolution higher than what resnet wants
              videoConstraints={videoConstraints}
            />
          </div>
  
          <Form.Button onClick={this.handleCapture}>Detect Labels</Form.Button>
        </div>
        
      );
    }
  }
  /*
  class ClassifiedImage extends Component {
    constructor(props) {
      super(props);
      this.state = {
        classLabel: null,
        probability: null,
      }
    }
  }
*/
class Rekognition extends Component {
    constructor(props){
        super(props);

        this.state = {
            image: '',
            resultMessage: '',
            resultLabels: ''
        }
    }

    
    sendImageToRekognition = () => {
        var base64Image = WebcamCapture.base64Image
        
        // convert image to bytestream from base64
        /*
        function _base64ToArrayBuffer(base64) {
            var binary_string =  window.atob(base64);
            var len = binary_string.length;
            var bytes = new Uint8Array( len );
            for (var i = 0; i < len; i++)        {
                bytes[i] = binary_string.charCodeAt(i);
            }
            return bytes.buffer;
        }
        
        var imageBytes = _base64ToArrayBuffer(base64Image);
        */ 
        // API call params
        var RekognitionParams = {
            Image: {
              Bytes: base64Image
              /* Alternatively, you can provide an S3 object 
              S3Object: {
                Bucket: 'STRING_VALUE',
                Name: 'STRING_VALUE',
                Version: 'STRING_VALUE'
              }*/
            },
            MaxLabels: 0, // max number of labels to return, 0 = no limit
            MinConfidence: 0 // threshold of minimum confidence for a label to be returned
          };
        
        // instantiate Rekognition client
        var rekognition = new AWS.Rekognition({apiVersion: '2017-07-01'});
        let currentComponent = this;

        // call Rekognition's detectLabels method
        rekognition.detectLabels(RekognitionParams, function (err, data){
            if (err) {
                currentComponent.setState({resultMessage: err.message});
            }
            else {
                console.log(data);
                currentComponent.setState({resultLabels: data.Labels.Name});
                currentComponent.setState({resultMessage: "Classification successful!"})
            }
        });

    }


    
    render(){
        let result, labels;
        if(this.state.resultMessage !== ''){
          result = <p>{this.state.resultMessage}</p>
          labels = <p>{this.state.resultLabels}</p>
        }
        return (
          <div className="App">
            <div className="container">
                <h1>Rekognition</h1>
                <p><code>detectLabels</code>: Detect object labels from an input image!</p>
                <div className="row">
                    <div className="col-md-8">
                        <Form>
                        <WebcamCapture onCapture={this.sendImageToRekognition}/>
                        </Form>
                    </div>
                    <div className="col-md-4">
                    Results:
                    {result}
                    {labels}
                    </div>
                </div>
            </div>
        </div>
        )
    }
}

export default Rekognition