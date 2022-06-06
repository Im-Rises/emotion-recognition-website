let video = document.getElementById("video");
let modelForFaceDetection;
let modelForEmotionRecognition;
// declare a canvas variable and get its context
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let facetensor = null;


const setupCamera = () => {
    navigator.mediaDevices
        .getUserMedia({
            video: {width: 600, height: 400},
            audio: false,
        })
        .then((stream) => {
            video.srcObject = stream;
        });
};

const detectFaces = async () => {
    const face = await modelForFaceDetection.estimateFaces(video, false);

    // draw the video first
    ctx.drawImage(video, 0, 0, 600, 400);

    if (face.length > 0) {
        // save face to test_face_extract folder
        for (const face1 of face) {
            const [y1, x1] = face1.topLeft;
            const [y2, x2] = face1.bottomRight;

            const x1s = Math.floor(x1 * video.width);
            const y1s = Math.floor(y1 * video.height);
            const x2s = Math.floor(x2 * video.width);
            const y2s = Math.floor(y2 * video.height);

            ctx.beginPath();
            ctx.lineWidth = "2";
            ctx.strokeStyle = "red";
            ctx.rect(
                y1,
                x1,
                y2 - y1,
                x2 - x1,
            );
            ctx.stroke();
            let img = ctx.getImageData(y1, x1, y2 - y1, x2 - x1);

            let resized = tf.browser.fromPixels(img).resizeBilinear([80, 80]) // [7, 7, 3]
            // const image = tf.ones([183, 275, 3 ])
            resized = tf.image.resizeBilinear(resized, [80, 80])
            resized = resized.reshape([1, 80, 80, 3]);

            let prediction = modelForEmotionRecognition.predict(resized).dataSync();
        }
    }
};

setupCamera();
video.addEventListener("loadeddata", async () => {
    modelForFaceDetection = await blazeface.load();
    modelForEmotionRecognition = await tf.loadLayersModel('https://raw.githubusercontent.com/clementreiffers/emotion-recognition-website/main/resnet50js_ferplus/model.json');
    // call detect faces every 100 milliseconds or 10 times every second
    setInterval(detectFaces, 100);
});