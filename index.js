const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const canvasBuffer = document.getElementById("canvasBuffer");
const canvasFace = document.getElementById("canvasFace");
const results = document.getElementById("showEmotion");
const select = document.getElementById("select");
const change_camera = document.getElementById("change_camera");

let ctx = canvas.getContext("2d");
let ctxBuffer = canvasBuffer.getContext("2d");
let ctxFace = canvasFace.getContext("2d");

let modelForFaceDetection;
let modelForEmotionRecognition;

let currentEmotion = "";
let currentStream;

let frameIter = 0;

const emotions = [
  "😡 angry : ",
  "🤮 disgust : ",
  "😨 fear : ",
  "😄 happy : ",
  "😐 neutral : ",
  "😭 sad : ",
  "😯 surprise : ",
];

const gotDevices = (mediaDevices) => {
  select.innerHTML = "";
  select.appendChild(document.createElement("option"));
  let count = 1;
  mediaDevices.forEach((mediaDevice) => {
    if (mediaDevice.kind === "videoinput") {
      const option = document.createElement("option");
      option.value = mediaDevice.deviceId;
      const label = mediaDevice.label || `Camera ${count++}`;
      const textNode = document.createTextNode(label);
      option.appendChild(textNode);
      select.appendChild(option);
    }
  });
};

const stopMediaTracks = (stream) => {
  stream.getTracks().forEach((track) => {
    track.stop();
  });
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
  modelForFaceDetection = await blazeface.load();
  modelForEmotionRecognition = await tf.loadLayersModel(
    "https://raw.githubusercontent.com/Im-Rises/emotion-recognition-website/main/resnet50js_ferplus/model.json"
  );
};

const getIndexOfMax = R.indexOf(Math.max);

const getBestEmotion = (pred) => emotions[getIndexOfMax(pred)];

const getPercentage = R.pipe(R.multiply(100), parseInt);

const getScoreInPercentage = R.map(getPercentage);

const getEmotionNearToItsScore = (listOfEmotions) => (pred) =>
  R.transpose([listOfEmotions, pred]);

const getListOfEmotionsSorted = R.sortBy(R.prop(1));

const magnifyOnePrediction = R.pipe(
  R.prepend("<p>"),
  R.append(" %</p>"),
  R.join("")
);

const magnifyResults = (listOfEmotions) =>
  R.pipe(
    getScoreInPercentage,
    getEmotionNearToItsScore(listOfEmotions),
    getListOfEmotionsSorted,
    R.reverse,
    R.map(magnifyOnePrediction),
    R.join("")
  );

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

    /*---------------------------------------------------------------------------*/
    /* Set buffer */

    // // Chrome
    // ctxBuffer.reset();
    //
    // // Firefox
    // ctxBuffer.rect(0, 0, canvas.width, canvas.height);

    // All platforms
    ctxBuffer.beginPath();
    ctxBuffer.fillStyle = "rgba(0, 0, 0, 0)";
    ctxBuffer.fillRect(0, 0, canvas.width, canvas.height);
    ctxBuffer.stroke();
    ctxBuffer.drawImage(video, 0, 0, canvas.width, canvas.height);
    /*---------------------------------------------------------------------------*/

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

    let imageData = ctxFace.getImageData(
      0,
      0,
      canvasFace.width,
      canvasFace.height
    ); // w then h (screen axis)

    frameIter++;

    if (frameIter >= 10) {
      // Check tensor memory leak start
      tf.engine().startScope();
      tf.tidy(() => {
        //// Conversion to tensor4D and resize
        let tfImage = tf.browser.fromPixels(imageData, 3).expandDims(0);

        let prediction = Array.from(
          modelForEmotionRecognition.predict(tfImage).dataSync()
        );
        currentEmotion = getBestEmotion(prediction);
        results.innerHTML = magnifyResults(emotions)(prediction);
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
};

navigator.mediaDevices.enumerateDevices().then(gotDevices);
change_camera.addEventListener("click", (event) => {
  if (typeof currentStream !== "undefined") {
    stopMediaTracks(currentStream);
  }
  const videoConstraints = {};
  if (select.value === "") {
    videoConstraints.facingMode = "environment";
  } else {
    videoConstraints.deviceId = { exact: select.value };
  }
  const constraints = {
    video: videoConstraints,
    audio: false,
  };

  navigator.mediaDevices
    .getUserMedia(constraints)
    .then((stream) => {
      currentStream = stream;
      video.srcObject = stream;
      return navigator.mediaDevices.enumerateDevices();
    })
    .then(gotDevices)
    .catch((error) => {
      console.error(error);
    });
});
setupCamera();
video.addEventListener("loadeddata", async () => {
  setInterval(detectFaces, 100); //in ms
});
