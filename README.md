# emotion-recognition-website

Emotion Recognition Website version.

## Description

Implementation of ou emotion_recognition AI Deep Leaning project as a web version using Tensorflowjs.
The website is running our ResNet50 model with the correct weights use in the original project, a simple web interface is implemented allowing you to look for your emotion details.

## Quickstart

You just need to go to this address with a browser :  
<https://clementreiffers.github.io/emotion-recognition-website>

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

Once its done replace the url in the index.js file for the model by the new model's link.

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
