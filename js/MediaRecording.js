/**
 *
 * Copyright 2015 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* global MediaRecorder, Recorder */

export default class MediaRecording {

  constructor() {
    const audioContext = new(window.AudioContext || window.webkitAudioContext || window.mozAudioContext)();

    this.usesMediaRecorder = ('MediaRecorder' in window &&
      typeof MediaRecorder.canRecordMimeType === 'undefined');

    this.recorder = this.usesMediaRecorder ?
      new MRRecorder(audioContext) :
      new LegacyRecorder(audioContext);

    console.log(this.recorder);
  }

  get complete() {
    return this.recorder.complete;
  }

  stop(deletePendingRecording = false) {
    this.recorder.stop(deletePendingRecording);
  }
}

class MRRecorder {

  constructor(audioContext) {

    console.log('Using MediaRecorder API.');

    this.deletePendingRecording = false;
    this.recorder = null;
    this.stream = null;
    this.recordedData = [];
    this.audioContext = audioContext;

    console.log(this.audioContext);

    this.sourceNode = undefined;

    this.complete = new Promise((resolve, reject) => {

      let config = {
        video: false,
        audio: true
      };

      let onStreamSuccess = stream => {

        this.stream = stream;
        this.sourceNode = this.audioContext.createMediaStreamSource(stream);

        this.recorder = new MediaRecorder(stream, {
          mimeType: 'audio/webm'
        });

        this.recorder.addEventListener('error', evt => {
          reject(evt);
        });

        this.recorder.addEventListener('dataavailable', evt => {

          if (typeof evt.data === 'undefined')
            return;

          if (evt.data.size === 0)
            return;

          this.recordedData.push(evt.data);
        });

        this.recorder.addEventListener('stop', evt => {

          let tracks = stream.getTracks();
          tracks.forEach(track => track.stop());

          let audioData = new Blob(this.recordedData, {
            type: 'audio/webm'
          });

          if (this.deletePendingRecording) {
            this.deletePendingRecording = false;
            audioData = null;
          }

          resolve(audioData);
        });

        // Record in 10ms bursts.
        this.recorder.start(10);
      }

      navigator.mediaDevices.getUserMedia(config)
        .then(onStreamSuccess)
        .catch(err => reject(err));
    });

  }

  stop(deletePendingRecording) {

    if (this.recorder.state !== 'recording')
      return;

    this.deletePendingRecording = deletePendingRecording;
    this.recorder.stop();
  }
}

class LegacyRecorder {

  constructor(audioContext) {

    console.log('Using legacy recorder.');
    this.audioContext = audioContext;
    this.recorder = null;
    this.deletePendingRecording = false;

    this.complete = new Promise((resolve, reject) => {

      this.recorder = new Recorder({
        workerPath: 'third_party/Recorderjs/recorderWorker.js',
        recordOpus: false
      });

      this.recorder.addEventListener('dataAvailable', evt => {

        let audioData = evt.detail;

        if (this.deletePendingRecording) {
          this.deletePendingRecording = false;
          audioData = null;
        }

        this.killStream();
        resolve(audioData);
      });

      this.recorder.addEventListener('streamReady', () => {
        this.recorder.start();
      });

      this.recorder.addEventListener('streamError', (err) => {
        reject(err);
      });
    });
  }

  stop(deletePendingRecording) {
    this.deletePendingRecording = deletePendingRecording;
    this.recorder.stop();
  }

  killStream() {
    if (!this.recorder.stream)
      return;

    let tracks = this.recorder.stream.getTracks();
    tracks.forEach(track => track.stop());
  }

}