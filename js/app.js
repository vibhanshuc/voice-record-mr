import '../css/app.scss';
import $ from "jquery";
import './mediaDevices-getUserMedia-polyfill';
import './Recorderjs/recorder';
// import './Recorderjs/recorderWorker';

import MediaRecording from './MediaRecording';

// const audioContext = new(AudioContext || webKitAudioContext || mozAudioContext);
let mediaRecorder;

let deletePendingRecording;
let recording;
let mediaRecording;

// const init = () => {
//     let chunks = [];
//     navigator.mediaDevices.getUserMedia({
//             audio: true
//         })
//         .then((stream) => {
//             console.log(stream);
//             mediaRecorder = new window.MediaRecorder(stream);

//             mediaRecorder.onstop = () => {
//                 const blob = new window.Blob(chunks, {
//                     type: 'audio/ogg; codecs=opus'
//                 });
//                 chunks = [];
//                 const audioURL = window.URL.createObjectURL(blob);
//                 addAudioClip(audioURL);
//             };

//             mediaRecorder.ondataavailable = (e) => {
//                 chunks.push(e.data);
//             };
//         })
//         .catch((err) => {
//             console.log(err);
//         });
// };

const addAudioClip = (url) => {
    const audio = document.createElement('audio');
    audio.src = url;
    audio.controls = true;
    document.body.appendChild(audio);
};

const startRecording = () => {

    alert('start recording');

    if (recording)
        return;

    let volumeData = [];
    let volumeMax = 1;
    let volumeSum = 0;

    recording = true;
    mediaRecording = new MediaRecording();
    mediaRecording.complete.then(audioData => {

            // Null audio data represents a cancelled recording.
            if (audioData === null)
                return;

            // Normalize volume data
            for (var d = 0; d < volumeData.length; d++) {
                volumeData[d] /= volumeMax;
            }

        })
        .catch(err => {
            console.log('stop rec', err);
            alert(err);
            deletePendingRecording = true;
            stopRecording();
        });
}

const stopRecording = () => {

    recording = false;
    if (!mediaRecording)
        return;

    mediaRecording.stop(deletePendingRecording);
    deletePendingRecording = false;
    const blob = new window.Blob(mediaRecording.recorder.recordedData, {
        type: 'audio/webm'
    });
    const audioURL = window.URL.createObjectURL(blob);
    addAudioClip(audioURL);
    
};


$('#start-button').on('click', startRecording);
$('#stop-button').on('click', stopRecording);
