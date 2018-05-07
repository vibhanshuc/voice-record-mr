import MediaRecording from './MediaRecording';

let mediaRecorder;

let deletePendingRecording;
let recording;
let mediaRecording;

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
            const audioURL = window.URL.createObjectURL(audioData);
            addAudioClip(audioURL);

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

};


document.getElementById('start-button').addEventListener('click', startRecording);

document.getElementById('stop-button').addEventListener('click', stopRecording);