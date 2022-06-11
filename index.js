const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const canvasFace = document.getElementById("canvasFace");
const results = document.getElementById("showEmotion");

let ctx = canvas.getContext("2d");
let ctxFace = canvasFace.getContext("2d");

let modelForFaceDetection;
let modelForEmotionRecognition;

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
    // Solution 1
    navigator.mediaDevices.getUserMedia({video: true, audio: false})
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

const detectFaces = async () => {
    ctx.reset();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

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

        const imageData = ctx.getImageData(x1, y1, width, height); // w then h (screen axis)

        // Check tensor memory leak start
        tf.engine().startScope();

        //// Conversion to tensor4D and resize
        let tfImage = await tf.browser.fromPixels(imageData, 3);
        let tfResizedImage = tf.image.resizeBilinear(tfImage, [80, 80]);
        tfResizedImage = tfResizedImage.reshape([1, 80, 80, 3]);
        let prediction = Array.from(modelForEmotionRecognition.predict(tfResizedImage).dataSync());
        currentEmotion = getBestEmotion(prediction);
        results.innerHTML = magnifyResults(prediction);

        // Check tensor memory leak stop
        tf.engine().endScope();

        // Draw croped face
        ctxFace.reset();
        ctxFace.putImageData(imageData, 0, 0);

        // Draw rectangle
        ctx.lineWidth = "10";
        ctx.strokeStyle = "red";
        ctx.rect(x1, y1, width, height);
        ctx.stroke();
    }
};

setupCamera();
video.addEventListener("loadeddata", async () => {
    setInterval(detectFaces, 100);
});
