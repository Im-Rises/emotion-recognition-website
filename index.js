const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const canvasBuffer = document.getElementById("canvasBuffer");
const canvasFace = document.getElementById("canvasFace");
const results = document.getElementById("showEmotion");

let ctx = canvas.getContext("2d");
let ctxBuffer = canvasBuffer.getContext("2d");
let ctxFace = canvasFace.getContext("2d");

let modelForFaceDetection;
let modelForEmotionRecognition;

let currentEmotion = "";

let frameIter = 0;

const emotions = {
  0: "😡 angry",
  1: "🤮 disgust",
  2: "😨 fear",
  3: "😄 happy",
  4: "😐 neutral",
  5: "😭 sad",
  6: "😯 surprise",
};

const setupCamera = async () => {
  // Solution 1
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: false })
    .then(function (stream) {
      video.srcObject = stream;
      video.play();
    })
    .catch(function (err) {
      console.log("An error occurred! " + err);
    });

  // // Solution 2
  // navigator.mediaDevices
  //     .getUserMedia({
  //         video: {width: canvas.width, height: canvas.height},
  //         audio: false,
  //     })
  //     .then((stream) => {
  //         video.srcObject = stream;
  //     });

  modelForFaceDetection = await blazeface.load();
  modelForEmotionRecognition = await tf.loadLayersModel(
    "https://raw.githubusercontent.com/Im-Rises/emotion-recognition-website/main/resnet50js_ferplus/model.json"
  );
};

const getIndexOfMax = (pred) => R.indexOf(getMax(pred), pred);

const getMax = (pred) => {
  let acc = 0;
  for (let i of pred) if (i > acc) acc = i;
  return acc;
};

const getBestEmotion = (pred) => emotions[getIndexOfMax(pred)];

const magnifyResults = (pred) => {
  let emotionsWithValue = [];
  let emotionsText = [];
  let magnified = "";

  // Sort by ascending order
  for (let i in pred)
    emotionsWithValue.push({
      emotion: emotions[i],
      value: parseInt(pred[i] * 100),
    });
  emotionsWithValue.sort((a, b) => b.value - a.value);

  // Create list of tags with emotions and probability
  for (let i in pred) {
    emotionsText.push(
      emotionsWithValue[i].emotion + " : " + emotionsWithValue[i].value
    );
    magnified +=
      "<p>" + emotionsText[i].toString().replace(/,/g, " ") + "%</p>";
  }

  return magnified;
};

const detectFaces = async () => {
  const face = await modelForFaceDetection.estimateFaces(video, false);

  if (face.length > 0) {
    // save face to test_face_extract folder
    let [x1, y1] = face[0].topLeft;
    let [x2, y2] = face[0].bottomRight;
    let width = x2 - x1;
    let height = y2 - y1;

    // Casts coordinates to ints
    x1 = parseInt(x1);
    y1 = parseInt(y1);
    width = parseInt(width);
    height = parseInt(height);

    // Set buffer
    ctxBuffer.reset();
    ctxBuffer.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Draw rectangle on buffer
    ctxBuffer.lineWidth = "2";
    ctxBuffer.strokeStyle = "red";
    ctxBuffer.rect(x1, y1, width, height);
    ctxBuffer.stroke();

    //Swap buffers
    ctx.drawImage(canvasBuffer, 0, 0, canvas.width, canvas.height);

    ctxFace.drawImage(
      canvas,
      x1,
      y1,
      width,
      height,
      0,
      0,
      canvasFace.width,
      canvasFace.height
    );

    let imageData = ctxFace.getImageData(0, 0, 80, 80); // w then h (screen axis)

    frameIter++;

    if (frameIter >= 10) {
      // Check tensor memory leak start
      tf.engine().startScope();
      tf.tidy(() => {
        //// Conversion to tensor4D and resize
        let tfImage = tf.browser.fromPixels(imageData, 3).expandDims(0);

        // // Resize and reshape method 1
        // let tfResizedImage = tf.image.resizeBilinear(tfImage, [80, 80]).expandDims(0);

        // // Resize and reshape method 2
        // let tfResizedImage = tf.image.resizeBilinear(tfImage, [80, 80]);
        // tfResizedImage = tfResizedImage.reshape([1, 80, 80, 3]);

        let prediction = Array.from(
          modelForEmotionRecognition.predict(tfImage).dataSync()
        );
        currentEmotion = getBestEmotion(prediction);
        results.innerHTML = magnifyResults(prediction);

        tfImage.dispose();
        // tfResizedImage.dispose();
      });
      // Check tensor memory leak stop
      tf.engine().endScope();

      frameIter = 0;
    }
  } else {
    // No swap buffers, copy video directly
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  }

  // console.log('Memory : ');
  // console.log(tf.memory());
};

setupCamera();
video.addEventListener("loadeddata", async () => {
  setInterval(detectFaces, 100); //in ms
});
