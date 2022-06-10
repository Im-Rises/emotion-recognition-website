const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const canvasBuffer = document.getElementById("canvasBuffer");
const canvasFace = document.getElementById("canvasFace");
const results = document.getElementById("showEmotion");

let modelForFaceDetection;
let modelForEmotionRecognition;
// declare a canvas variable and get its context
let ctx = canvas.getContext("2d");
let ctxBuffer = canvasBuffer.getContext("2d");
let ctxFace = canvasFace.getContext("2d");
let x1, y1, x2, y2;
let currentEmotion = "";


const emotions = {
    0: "😡 angry",
    1: "🤮 disgust",
    2: "😨 fear",
    3: "😄 happy",
    4: "😐 neutral",
    5: "😭 sad",
    6: "😯 surprise",
}

const setupCamera = async () => {
    navigator.mediaDevices
        .getUserMedia({
            video: {width: canvas.width, height: canvas.height},
            audio: false,
        })
        .then((stream) => {
            video.srcObject = stream;
        });
    modelForFaceDetection = await blazeface.load();
    modelForEmotionRecognition = await tf.loadLayersModel('https://raw.githubusercontent.com/Im-Rises/emotion-recognition-website/main/resnet50js_ferplus/model.json');

};

const getIndexOfMax = (pred) => R.indexOf(getMax(pred), pred);

const getMax = (pred) => {
    let acc = 0;
    for (let i of pred) if (i > acc) acc = i;
    return acc;
}

const getBestEmotion = (pred) => emotions[getIndexOfMax(pred)];

const magnifyResults = (pred) => {
    let emotionsWithValue = [];
    let magnified = "";
    for (let i in pred) emotionsWithValue.push(emotions[i] + " : " + parseInt(pred[i] * 100));
    for (let i in emotionsWithValue) magnified += '<p>' + emotionsWithValue[i].toString().replace(/,/g, ' ') + '%</p>';
    return magnified;
}

const drawOnCanvas = () => {
    ctx.reset();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctxBuffer.drawImage(video, 0, 0, canvas.width, canvas.height);
}

const detectFaces = async () => {
    drawOnCanvas();

    const face = await modelForFaceDetection.estimateFaces(video, false);

    if (face.length > 0) {
        // save face to test_face_extract folder
        let [x1, y1] = face[0].topLeft;
        let [x2, y2] = face[0].bottomRight;
        let width = x2 - x1;
        let height = y2 - y1;

        // Recalculate real coordinates to catch completely the face
        x1 = parseInt(x1 + width / 8);
        y1 = parseInt(y1 - height / 2);
        width = parseInt(width-width / 4);
        height = parseInt(height+height * 2 / 3);

        // Draw rectangle
        ctx.lineWidth = "10";
        ctx.strokeStyle = "red";
        ctx.rect(x1, y1, width, height);
        ctx.stroke();

        tf.engine().startScope();

        const imageData = ctxBuffer.getImageData(x1, y1, width, height); // w then h (screen axis)
        const uint8array = new Uint8Array(imageData.data.buffer);
        const rgbaTens4d = tf.tensor4d(uint8array, [1, height, width, 4]); // h then w (image axis)
        const rgbTens4d = tf.slice4d(rgbaTens4d, [0, 0, 0, 0], [-1, -1, -1, 3]);
        let smallImg = tf.image.resizeBilinear(rgbTens4d, [80, 80]);
        // const smallImg = tf.image.resizeNearestNeighbor(rgbTens4d, [80, 80]);

        // // Preprocess images
        // smallImg = smallImg.sub(tf.scalar(128));//-128
        // smallImg = smallImg.div(tf.scalar(255));//divide by 2
        // smallImg.print();

        let prediction = Array.from(modelForEmotionRecognition.predict(smallImg).dataSync());
        currentEmotion = getBestEmotion(prediction);
        results.innerHTML = magnifyResults(prediction);

        // Draw croped face
        ctxFace.reset();
        ctxFace.putImageData(imageData, 0, 0);

        tf.engine().endScope();
    }
};

setupCamera();
video.addEventListener("loadeddata", async () => {
    setInterval(detectFaces, 100);
});
