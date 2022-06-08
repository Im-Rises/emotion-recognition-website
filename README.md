# emotion-recognition-website

<p align="center">
    <img src="https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E" alt="javascriptLogo" style="height:50px">
    <img src="https://user-images.githubusercontent.com/59691442/169644815-7c59a948-09a4-4cd5-9a7d-d06d5dcd3ce1.svg" alt="tensorflowjsLogo" style="height:50px;">
</p>

## Description

Implementation of ou emotion_recognition AI Deep Leaning project as a web version using TensorFlow.js.
The website is running our ResNet50 model with the correct weights use in the original project, a simple web interface is implemented allowing you to look for your emotion details.

## Images

Placeholder

## Quickstart

You just need to go to this address with a browser :  
<https://im-rises.github.io/emotion-recognition-website/>

## Modify/Change model

First you need to install python and some libs :
<https://www.python.org>

To install the libs run the following command :
```bash
pip install -r requirements.txt
```

If you want to use another model for the emotion recognition. Save a model from a python script as a .h5 with the models and the weights.

Then just run the `converter.py` script by typing in your terminal :

```bash
py ./converter.py <yourModel.h5> <nameOfYourTensorflowjsModel> 
```

Or type the following command

```bash 
tensorflowjs_converter --input_format keras <path/to/my_model.h5> <path/to/tfjs_target_dir>
```

Once it's done replace the url in the index.js file for the model by the new model's link.

## Images

Placeholder.

## Original project

emotion_recognition :  
<https://github.com/clementreiffers/emotion_recognition_cnn>

## Documentations

Tensorflowjs :  
<https://www.tensorflow.org/js>
<https://www.tensorflow.org/js/models>

Tensorflow python model to tensorflowjs :  
<https://www.tensorflow.org/js/tutorials/conversion/import_keras>

BlazeFace :  
<https://www.npmjs.com/package/@tensorflow-models/blazeface>

## Contributors

Clément REIFFERS :  

- @clementreiffers  
- <https://github.com/clementreiffers>

Quentin MOREL :

- @Im-Rises
- <https://github.com/Im-Rises>

[![GitHub contributors](https://contrib.rocks/image?repo=im-rises/emotion-recognition-website)](https://github.com/im-rises/emotion-recognition-website/graphs/contributors)
