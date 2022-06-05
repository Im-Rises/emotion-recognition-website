import tensorflowjs
from keras.models import load_model

# https://www.tensorflow.org/js/tutorials/conversion/import_keras

# Convert h5 model+weights from tensorflowpython to tensorflowjs
if __name__ == "__main__":
    model = load_model("resnet50_model_weights_ferplus_v2.h5")
    model.summary()
    tensorflowjs.converters.save_keras_model(model, "resnet50js_ferplus")
