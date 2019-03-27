import React, {Component} from 'react';
import { Form } from 'semantic-ui-react';
import Webcam from 'react-webcam';
var dataUriToBuffer = require('data-uri-to-buffer');
var AWS = require('aws-sdk');
AWS.config.region = 'us-east-1'; 
AWS.config.credentials = new AWS.CognitoIdentityCredentials({IdentityPoolId: 'us-east-1:1956382a-b3f6-472c-9a8d-3a246853c917'});

class Rekognition extends Component {
    constructor(props){
        super(props);

        this.state = {
            image: '',
            resultMessage: '',
            resultLabels: [],
            resultLandmarks: [],
            resultEmotions: [],
            resultEyesOpen: [],
            resultMustache: [],
            resultMouthOpen: [],
            resultSmile: [],
            resultSunglasses: [],
            resultBeard: [],
            resultMisc: [],
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
        
        // API call params
        var RekognitionDetectLabelsParams = {
            Image: {
              Bytes: buffer
              /* Alternatively, you can provide an S3 object 
              S3Object: {
                Bucket: 'STRING_VALUE',
                Name: 'STRING_VALUE',
                Version: 'STRING_VALUE'
              }*/
            },
          };
        
        var RekognitionDetectFacesParams = {
            Image: {
              Bytes: buffer
              /* Alternatively, you can provide an S3 object 
              S3Object: {
                Bucket: 'STRING_VALUE',
                Name: 'STRING_VALUE',
                Version: 'STRING_VALUE'
              }*/
            },
            Attributes: ["ALL"]
          };

        // instantiate Rekognition client
        var rekognition = new AWS.Rekognition();
        let currentComponent = this;
            
        // call Rekognition's detectLabels method
        rekognition.detectLabels(RekognitionDetectLabelsParams, function (err, data){
            if (err) {
                currentComponent.setState({resultMessage: err.message});
            }
            else {
                console.log(data);
                currentComponent.setState({resultLabels: data.Labels});
                currentComponent.setState({resultMessage: "Classification successful!"})
            }
        });

        
        // call Rekognition's detectFaces method
        // values of interest: Mustache, MouthOpen, EyesOpen, Landmarks
        rekognition.detectFaces(RekognitionDetectFacesParams, function (err, data){
          if (err) {
              currentComponent.setState({resultMessage: err.message});
          }
          else if (data.FaceDetails.length === 0){
            currentComponent.setState({resultMessage: "No faces detected!"});
            currentComponent.setState({resultLandmarks: []});
            currentComponent.setState({resultEmotions: []});
            currentComponent.setState({resultEyesOpen: []});
            currentComponent.setState({resultMouthOpen: []});
            currentComponent.setState({resultMustache: []});
            currentComponent.setState({resultSmile: []});
            currentComponent.setState({resultSunglasses: []});
            currentComponent.setState({resultBeard: []});
          }
          else {
              console.log(data);
              currentComponent.setState({resultLandmarks: data.FaceDetails[0].Landmarks});
              currentComponent.setState({resultEmotions: data.FaceDetails[0].Emotions});
              currentComponent.setState({resultEyesOpen: data.FaceDetails[0].EyesOpen});
              currentComponent.setState({resultMouthOpen: data.FaceDetails[0].MouthOpen});
              currentComponent.setState({resultMustache: data.FaceDetails[0].Mustache});
              currentComponent.setState({resultSmile: data.FaceDetails[0].Smile});
              currentComponent.setState({resultSunglasses: data.FaceDetails[0].Sunglasses});
              currentComponent.setState({resultBeard: data.FaceDetails[0].Beard});
              //currentComponent.setState({resultlandmarks: data.FaceDetails});

              // Add states for the other metadata
              // currentComponent.setState({result})
              currentComponent.setState({resultMessage: "Facial detection complete!"})
          }
      });
      

    }

    
    render(){
        let result, labels, landmarks, emotions, misc /* emotions, mustaches, beards, sunglasses*/;
        if(this.state.resultMessage !== ''){
          result = <p>{this.state.resultMessage}</p>          
          
          labels = this.state.resultLabels.map((label, i) => {
              return (<tr key={i}>
                        <td>
                          {label.Name}
                        </td>
                        <td>
                          {Math.floor(label.Confidence*10000)/10000}
                        </td>
                    </tr>
              )
            
            })

            landmarks = this.state.resultLandmarks.map((landmark, i) => {
              return (<tr key={i}>
                        <td>
                          {landmark.Type}
                        </td>
                        <td>
                          {Math.floor((landmark.X*400)*10000)/10000}
                        </td>
                        <td>
                          {Math.floor((landmark.Y*350)*10000)/10000}
                        </td>
                    </tr>
              )
              
            })
           
            // to be added with emotions 
            emotions = this.state.resultEmotions.map((emotion, i) => {
              return (<tr key={i}>
                        <td>
                          {emotion.Type}
                        </td>
                        <td>
                          { Math.floor(emotion.Confidence*10000)/10000 }
                        </td>
                    </tr>
              )
              
            })
            
            // all other binary properties thrown into one table
            misc = 
              <tbody>
              <tr>
                <td>Smile</td>
                <td>{ this.state.resultSmile.Value+'' }</td>
                <td>{ Math.floor(this.state.resultSmile.Confidence*10000)/10000 }</td>
              </tr>
              <tr>
                <td>MouthOpen</td>
                <td>{ this.state.resultMouthOpen.Value+'' }</td>
                <td>{ Math.floor(this.state.resultMouthOpen.Confidence*10000)/10000 }</td>
              </tr>
              <tr>
                <td>EyesOpen</td>
                <td>{ this.state.resultEyesOpen.Value+'' }</td>
                <td>{ Math.floor(this.state.resultEyesOpen.Confidence*10000)/10000 }</td>
              </tr>
              <tr>
                <td>Sunglasses</td>
                <td>{ this.state.resultSunglasses.Value+'' }</td>
                <td>{ Math.floor(this.state.resultSunglasses.Confidence*10000)/10000 }</td>
              </tr>
              <tr>
                <td>Mustache</td>
                <td>{ this.state.resultMustache.Value+'' }</td>
                <td>{ Math.floor(this.state.resultMustache.Confidence*10000)/10000 }</td>
              </tr>
              <tr>
                <td>Beard</td>
                <td>{ this.state.resultBeard.Value+'' }</td>
                <td>{ Math.floor(this.state.resultBeard.Confidence*10000)/10000 }</td>
              </tr>
              </tbody>
             
        }
        const videoConstraints = {
          facingMode: "user"
        };
        return (
          <div className="App">
            <div className="container">
                <h1>Rekognition</h1>
                <p><code>detectLabels</code>: Detect object labels from an input image/video!</p>
                <p><code>detectFaces</code>: Detect faces and relevant metadata from an input image/video!</p>
                <div className="row">
                    <div className="col-md-6">
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
                    
                    <div className="col-md-3">
                    {result}
                      <span><u>DetectLabels Results:</u></span>
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
                    <div className="col-md-3">
                      <span><u>DetectFaces Results:</u></span>
                      <table>
                        <thead>
                          <tr>
                            <th>
                              Emotion
                            </th>
                            <th>
                              Confidence
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                        {emotions}
                        </tbody>
                      </table>
                      <br></br>
                      <table>
                        <thead>
                          <tr>
                            <th>
                              Property
                            </th>
                            <th>
                              Value
                            </th>
                            <th>
                              Confidence
                            </th>
                          </tr>
                        </thead>
                        {misc}
                      </table>
                      <br></br>
                      <table>
                        <thead>
                          <tr>
                            <th>
                              Landmark Type
                            </th>
                            <th>
                              X Coordinate
                            </th>
                            <th>
                              Y Coordinate
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                        {landmarks}
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