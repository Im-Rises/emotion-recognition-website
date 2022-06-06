import tensorflowjs
from keras.models import load_model
import sys

# https://www.tensorflow.org/js/tutorials/conversion/import_keras
# Convert h5 model+weights from tensorflowpython to tensorflowjs
if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage : py ./converter.py <yourModel.h5> <nameOfYourTensorflowjsModel> ")
    else:
        model = load_model(sys.argv[1])
        model.summary()
        tensorflowjs.converters.save_keras_model(model, sys.argv[2])
