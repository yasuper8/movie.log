console.log("app.js is connected!!!");

$(document).ready(function(){

  var recordRTC;

  function successCallback(stream) {
      // RecordRTC usage goes here
  }

  function errorCallback(error) {
      // maybe another application is using the device
  }

  var mediaConstraints = { video: true, audio: true };

  navigator.mediaDevices.getUserMedia(mediaConstraints).then(successCallback).catch(errorCallback);


  function successCallback(stream) {
      // RecordRTC usage goes here

      var options = {
        mimeType: 'video/webm', // or video/mp4 or audio/ogg
        audioBitsPerSecond: 128000,
        videoBitsPerSecond: 128000,
        bitsPerSecond: 128000 // if this line is provided, skip above two
      };
      recordRTC = RecordRTC(stream, options);
      recordRTC.startRecording();
  }

  function errorCallback(error) {
      // maybe another application is using the device
  }

  var mediaConstraints = { video: true, audio: true };

  navigator.mediaDevices.getUserMedia(mediaConstraints).then(successCallback).catch(errorCallback);

  btnStopRecording.onclick = function () {
      recordRTC.stopRecording(function (audioVideoWebMURL) {
          video.src = audioVideoWebMURL;

          var recordedBlob = recordRTC.getBlob();
          recordRTC.getDataURL(function(dataURL) { });
      });
  };

});
