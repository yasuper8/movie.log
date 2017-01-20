console.log("record.js linked!");

$(document).ready(function(){

  (function() {
      var params = {},
          r = /([^&=]+)=?([^&]*)/g;

      function d(s) {
          return decodeURIComponent(s.replace(/\+/g, ' '));
      }

      var match, search = window.location.search;
      while (match = r.exec(search.substring(1))) {
          params[d(match[1])] = d(match[2]);

          if(d(match[2]) === 'true' || d(match[2]) === 'false') {
              params[d(match[1])] = d(match[2]) === 'true' ? true : false;
          }
      }

      window.params = params;
  })();

  function addStreamStopListener(stream, callback) {
      var streamEndedEvent = 'ended';

      if ('oninactive' in stream) {
          streamEndedEvent = 'inactive';
      }

      stream.addEventListener(streamEndedEvent, function() {
          callback();
          callback = function() {};
      }, false);

      stream.getAudioTracks().forEach(function(track) {
          track.addEventListener(streamEndedEvent, function() {
              callback();
              callback = function() {};
          }, false);
      });

      stream.getVideoTracks().forEach(function(track) {
          track.addEventListener(streamEndedEvent, function() {
              callback();
              callback = function() {};
          }, false);
      });
  }




  function intallFirefoxScreenCapturingExtension() {
      InstallTrigger.install({
          'Foo': {
              // URL: 'https://addons.mozilla.org/en-US/firefox/addon/enable-screen-capturing/',
              URL: 'https://addons.mozilla.org/firefox/downloads/file/355418/enable_screen_capturing_in_firefox-1.0.006-fx.xpi?src=cb-dl-hotness',
              toString: function() {
                  return this.URL;
              }
          }
      });
  }

  var recordingDIV = document.querySelector('.recordrtc');
  var recordingMedia = recordingDIV.querySelector('.recording-media');
  var recordingPlayer = recordingDIV.querySelector('video');
  var mediaContainerFormat = recordingDIV.querySelector('.media-container-format');

  window.onbeforeunload = function() {
      recordingDIV.querySelector('button').disabled = false;
      recordingMedia.disabled = false;
      mediaContainerFormat.disabled = false;
  };

  recordingDIV.querySelector('button').onclick = function(event) {
      var button = recordingDIV.querySelector('button');

      if(button.innerHTML === 'Stop Recording') {
          button.disabled = true;
          button.disableStateWaiting = true;
          setTimeout(function() {
              button.disabled = false;
              button.disableStateWaiting = false;
          }, 2 * 1000);

          button.innerHTML = 'Star Recording';

          function stopStream() {
              if(button.stream && button.stream.stop) {
                  button.stream.stop();
                  button.stream = null;
              }
          }

          if(button.recordRTC) {
              if(button.recordRTC.length) {
                  button.recordRTC[0].stopRecording(function(url) {
                      if(!button.recordRTC[1]) {
                          button.recordingEndedCallback(url);
                          stopStream();

                          saveToDiskOrOpenNewTab(button.recordRTC[0]);
                          return;
                      }

                      button.recordRTC[1].stopRecording(function(url) {
                          button.recordingEndedCallback(url);
                          stopStream();
                      });
                  });
              }
              else {
                  button.recordRTC.stopRecording(function(url) {
                      button.recordingEndedCallback(url);
                      stopStream();

                      saveToDiskOrOpenNewTab(button.recordRTC);
                      window.open(URL.createObjectURL(button.recordRTC.getBlob()));
                  });
              }
          }

          return;
      }

      if(!event) return;

      button.disabled = true;

      var commonConfig = {
          onMediaCaptured: function(stream) {
              button.stream = stream;
              if(button.mediaCapturedCallback) {
                  button.mediaCapturedCallback();
              }

              button.innerHTML = 'Stop Recording';
              button.disabled = false;
          },
          onMediaStopped: function() {
              button.innerHTML = 'Start Recording';

              if(!button.disableStateWaiting) {
                  button.disabled = false;
              }
          },
          onMediaCapturingFailed: function(error) {
              if(error.name === 'PermissionDeniedError' && !!navigator.mozGetUserMedia) {
                  intallFirefoxScreenCapturingExtension();
              }

              commonConfig.onMediaStopped();
          }
      };

      var mimeType = 'video/webm';
      if(mediaContainerFormat.value === 'Mp4') {
          mimeType = 'video/mp4; codecs=h264';
      }

      if(recordingMedia.value === 'record-audio') {
          captureAudio(commonConfig);

          button.mediaCapturedCallback = function() {
              var options = {
                  type: 'audio',
                  mimeType: mimeType,
                  bufferSize: typeof params.bufferSize == 'undefined' ? 0 : parseInt(params.bufferSize),
                  sampleRate: typeof params.sampleRate == 'undefined' ? 44100 : parseInt(params.sampleRate),
                  leftChannel: params.leftChannel || false,
                  disableLogs: params.disableLogs || false,
                  recorderType: webrtcDetectedBrowser === 'edge' ? StereoAudioRecorder : null
              };

              if(typeof params.sampleRate == 'undefined') {
                  delete options.sampleRate;
              }

              button.recordRTC = RecordRTC(button.stream, options);

              button.recordingEndedCallback = function(url) {
                  var audio = new Audio();
                  audio.src = url;
                  audio.controls = true;
                  recordingPlayer.parentNode.appendChild(document.createElement('hr'));
                  recordingPlayer.parentNode.appendChild(audio);

                  if(audio.paused) audio.play();

                  audio.onended = function() {
                      audio.pause();
                      audio.src = URL.createObjectURL(button.recordRTC.blob);
                  };
              };

              button.recordRTC.startRecording();
          };
      }

      if(recordingMedia.value === 'record-audio-plus-video') {
          captureAudioPlusVideo(commonConfig);

          button.mediaCapturedCallback = function() {

              if(typeof MediaRecorder === 'undefined') { // opera or chrome etc.
                  button.recordRTC = [];

                  if(!params.bufferSize) {
                      // it fixes audio issues whilst recording 720p
                      params.bufferSize = 16384;
                  }

                  var options = {
                      type: 'audio',
                      bufferSize: typeof params.bufferSize == 'undefined' ? 0 : parseInt(params.bufferSize),
                      sampleRate: typeof params.sampleRate == 'undefined' ? 44100 : parseInt(params.sampleRate),
                      leftChannel: params.leftChannel || false,
                      disableLogs: params.disableLogs || false,
                      recorderType: webrtcDetectedBrowser === 'edge' ? StereoAudioRecorder : null
                  };

                  if(typeof params.sampleRate == 'undefined') {
                      delete options.sampleRate;
                  }

                  var audioRecorder = RecordRTC(button.stream, options);

                  var videoRecorder = RecordRTC(button.stream, {
                      type: 'video',
                      disableLogs: params.disableLogs || false,
                      canvas: {
                          width: params.canvas_width || 320,
                          height: params.canvas_height || 240
                      },
                      frameInterval: typeof params.frameInterval !== 'undefined' ? parseInt(params.frameInterval) : 20 // minimum time between pushing frames to Whammy (in milliseconds)
                  });

                  // to sync audio/video playbacks in browser!
                  videoRecorder.initRecorder(function() {
                      audioRecorder.initRecorder(function() {
                          audioRecorder.startRecording();
                          videoRecorder.startRecording();
                      });
                  });

                  button.recordRTC.push(audioRecorder, videoRecorder);

                  button.recordingEndedCallback = function() {
                      var audio = new Audio();
                      audio.src = audioRecorder.toURL();
                      audio.controls = true;
                      audio.autoplay = true;

                      audio.onloadedmetadata = function() {
                          recordingPlayer.src = videoRecorder.toURL();
                          recordingPlayer.play();
                      };

                      recordingPlayer.parentNode.appendChild(document.createElement('hr'));
                      recordingPlayer.parentNode.appendChild(audio);

                      if(audio.paused) audio.play();
                  };
                  return;
              }

              button.recordRTC = RecordRTC(button.stream, {
                  type: 'video',
                  mimeType: mimeType,
                  disableLogs: params.disableLogs || false,
                  // bitsPerSecond: 25 * 8 * 1025 // 25 kbits/s
                  getNativeBlob: false // enable it for longer recordings
              });

              button.recordingEndedCallback = function(url) {
                  recordingPlayer.muted = false;
                  recordingPlayer.removeAttribute('muted');
                  recordingPlayer.src = url;
                  recordingPlayer.play();

                  recordingPlayer.onended = function() {
                      recordingPlayer.pause();
                      recordingPlayer.src = URL.createObjectURL(button.recordRTC.blob);
                  };
              };

              button.recordRTC.startRecording();
          };
      }

      if(recordingMedia.value === 'record-screen') {
          captureScreen(commonConfig);

          button.mediaCapturedCallback = function() {
              button.recordRTC = RecordRTC(button.stream, {
                  type: mediaContainerFormat.value === 'Gif' ? 'gif' : 'video',
                  mimeType: mimeType,
                  disableLogs: params.disableLogs || false,
                  canvas: {
                      width: params.canvas_width || 320,
                      height: params.canvas_height || 240
                  }
              });

              button.recordingEndedCallback = function(url) {
                  recordingPlayer.src = null;

                  if(mediaContainerFormat.value === 'Gif') {
                      recordingPlayer.pause();
                      recordingPlayer.poster = url;
                      recordingPlayer.onended = function() {
                          recordingPlayer.pause();
                          recordingPlayer.poster = URL.createObjectURL(button.recordRTC.blob);
                      };
                      return;
                  }

                  recordingPlayer.src = url;
                  recordingPlayer.play();
              };

              button.recordRTC.startRecording();
          };
      }

      // note: audio+tab is supported in Chrome 50+
      // todo: add audio+tab recording
      if(recordingMedia.value === 'record-audio-plus-screen') {
          captureAudioPlusScreen(commonConfig);

          button.mediaCapturedCallback = function() {
              button.recordRTC = RecordRTC(button.stream, {
                  type: 'video',
                  mimeType: mimeType,
                  disableLogs: params.disableLogs || false,
                  // bitsPerSecond: 25 * 8 * 1025 // 25 kbits/s
                  getNativeBlob: false // enable it for longer recordings
              });

              button.recordingEndedCallback = function(url) {
                  recordingPlayer.muted = false;
                  recordingPlayer.removeAttribute('muted');
                  recordingPlayer.src = url;
                  recordingPlayer.play();

                  recordingPlayer.onended = function() {
                      recordingPlayer.pause();
                      recordingPlayer.src = URL.createObjectURL(button.recordRTC.blob);
                  };
              };

              button.recordRTC.startRecording();
          };
      }
  };

  function captureVideo(config) {
      captureUserMedia({video: true}, function(videoStream) {
          recordingPlayer.srcObject = videoStream;
          recordingPlayer.play();

          config.onMediaCaptured(videoStream);

          addStreamStopListener(videoStream, function() {
              config.onMediaStopped();
          });
      }, function(error) {
          config.onMediaCapturingFailed(error);
      });
  }

  function captureAudio(config) {
      captureUserMedia({audio: true}, function(audioStream) {
          recordingPlayer.srcObject = audioStream;
          recordingPlayer.play();

          config.onMediaCaptured(audioStream);

          addStreamStopListener(audioStream, function() {
              config.onMediaStopped();
          });
      }, function(error) {
          config.onMediaCapturingFailed(error);
      });
  }

  function captureAudioPlusVideo(config) {
      captureUserMedia({video: true, audio: true}, function(audioVideoStream) {
          recordingPlayer.srcObject = audioVideoStream;
          recordingPlayer.play();

          config.onMediaCaptured(audioVideoStream);

          addStreamStopListener(audioVideoStream, function() {
              config.onMediaStopped();
          });
      }, function(error) {
          config.onMediaCapturingFailed(error);
      });
  }

  function captureScreen(config) {
      getScreenId(function(error, sourceId, screenConstraints) {
          if (error === 'not-installed') {
              document.write('<h1><a target="_blank" href="https://chrome.google.com/webstore/detail/screen-capturing/ajhifddimkapgcifgcodmmfdlknahffk">Please install this chrome extension then reload the page.</a></h1>');
          }

          if (error === 'permission-denied') {
              alert('Screen capturing permission is denied.');
          }

          if (error === 'installed-disabled') {
              alert('Please enable chrome screen capturing extension.');
          }

          if(error) {
              config.onMediaCapturingFailed(error);
              return;
          }

          delete screenConstraints.video.mozMediaSource;
          captureUserMedia(screenConstraints, function(screenStream) {
              recordingPlayer.srcObject = screenStream;
              recordingPlayer.play();

              config.onMediaCaptured(screenStream);

              addStreamStopListener(screenStream, function() {
                  // config.onMediaStopped();

                  recordingDIV.querySelector('button').onclick();
              });
          }, function(error) {
              config.onMediaCapturingFailed(error);
          });
      });
  }

  function captureAudioPlusScreen(config) {
      getScreenId(function(error, sourceId, screenConstraints) {
          if (error === 'not-installed') {
              document.write('<h1><a target="_blank" href="https://chrome.google.com/webstore/detail/screen-capturing/ajhifddimkapgcifgcodmmfdlknahffk">Please install this chrome extension then reload the page.</a></h1>');
          }

          if (error === 'permission-denied') {
              alert('Screen capturing permission is denied.');
          }

          if (error === 'installed-disabled') {
              alert('Please enable chrome screen capturing extension.');
          }

          if(error) {
              config.onMediaCapturingFailed(error);
              return;
          }

          delete screenConstraints.video.mozMediaSource;
          captureUserMedia(screenConstraints, function(screenStream) {
              captureUserMedia({audio: true}, function(audioStream) {
                  // merge audio tracks into the screen
                  screenStream.addTrack(audioStream.getAudioTracks()[0]);

                  recordingPlayer.srcObject = screenStream;
                  recordingPlayer.play();

                  config.onMediaCaptured(screenStream);

                  addStreamStopListener(screenStream, function() {
                      config.onMediaStopped();
                  });
              }, function(error) {
                  config.onMediaCapturingFailed(error);
              });
          }, function(error) {
              config.onMediaCapturingFailed(error);
          });
      });
  }

  function captureUserMedia(mediaConstraints, successCallback, errorCallback) {
      var isBlackBerry = !!(/BB10|BlackBerry/i.test(navigator.userAgent || ''));
      if(isBlackBerry && !!(navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia)) {
          navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
          navigator.getUserMedia(mediaConstraints, successCallback, errorCallback);
          return;
      }

      navigator.mediaDevices.getUserMedia(mediaConstraints).then(successCallback).catch(errorCallback);
  }

  function setMediaContainerFormat(arrayOfOptionsSupported) {
      var options = Array.prototype.slice.call(
          mediaContainerFormat.querySelectorAll('option')
      );

      var selectedItem;
      options.forEach(function(option) {
          option.disabled = true;

          if(arrayOfOptionsSupported.indexOf(option.value) !== -1) {
              option.disabled = false;

              if(!selectedItem) {
                  option.selected = true;
                  selectedItem = option;
              }
          }
      });
  }

  recordingMedia.onchange = function() {
      var options = [];
      if(webrtcDetectedBrowser === 'firefox') {
          if(recordingMedia.value === 'record-audio') {
              options.push('Ogg', 'WebM');
          }
          else {
              options.push('WebM', 'Mp4', 'Gif');
          }

          setMediaContainerFormat(options);
          return;
      }
      if(recordingMedia.value === 'record-audio') {
          setMediaContainerFormat(['WAV', 'WebM']);
          return;
      }
      setMediaContainerFormat(['WebM', 'Mp4', 'Gif']);
  };
  recordingMedia.onchange();

  if(webrtcDetectedBrowser === 'edge') {
      // webp isn't supported in Microsoft Edge
      // neither MediaRecorder API
      // so lets disable both video/screen recording options

      console.warn('Neither MediaRecorder API nor webp is supported in Microsoft Edge. You cam merely record audio.');

      recordingMedia.innerHTML = '<option value="record-audio">Audio</option>';
      setMediaContainerFormat(['WAV']);
  }

  function saveToDiskOrOpenNewTab(recordRTC) {
      recordingDIV.querySelector('#save-to-disk').parentNode.style.display = 'block';
      recordingDIV.querySelector('#save-to-disk').onclick = function() {
          if(!recordRTC) return alert('No recording found.');

          recordRTC.save();
      };

      recordingDIV.querySelector('#open-new-tab').onclick = function() {
          if(!recordRTC) return alert('No recording found.');

          window.open(URL.createObjectURL(recordRTC.getBlob()));
      };
  }




  // todo: need to check exact chrome browser because opera also uses chromium framework
  var isChrome = !!navigator.webkitGetUserMedia;

  // DetectRTC.js - https://github.com/muaz-khan/WebRTC-Experiment/tree/master/DetectRTC
  // Below code is taken from RTCMultiConnection-v1.8.js (http://www.rtcmulticonnection.org/changes-log/#v1.8)
  var DetectRTC = {};

  (function () {

      var screenCallback;

      DetectRTC.screen = {
          chromeMediaSource: 'screen',
          getSourceId: function(callback) {
              if(!callback) throw '"callback" parameter is mandatory.';
              screenCallback = callback;
              window.postMessage('get-sourceId', '*');
          },
          isChromeExtensionAvailable: function(callback) {
              if(!callback) return;

              if(DetectRTC.screen.chromeMediaSource == 'desktop') return callback(true);

              // ask extension if it is available
              window.postMessage('are-you-there', '*');

              setTimeout(function() {
                  if(DetectRTC.screen.chromeMediaSource == 'screen') {
                      callback(false);
                  }
                  else callback(true);
              }, 2000);
          },
          onMessageCallback: function(data) {
              if (!(typeof data == 'string' || !!data.sourceId)) return;

              console.log('chrome message', data);

              // "cancel" button is clicked
              if(data == 'PermissionDeniedError') {
                  DetectRTC.screen.chromeMediaSource = 'PermissionDeniedError';
                  if(screenCallback) return screenCallback('PermissionDeniedError');
                  else throw new Error('PermissionDeniedError');
              }

              // extension notified his presence
              if(data == 'rtcmulticonnection-extension-loaded') {
                  if(document.getElementById('install-button')) {
                      document.getElementById('install-button').parentNode.innerHTML = '<strong>Great!</strong> <a href="https://chrome.google.com/webstore/detail/screen-capturing/ajhifddimkapgcifgcodmmfdlknahffk" target="_blank">Google chrome extension</a> is installed.';
                  }
                  DetectRTC.screen.chromeMediaSource = 'desktop';
              }

              // extension shared temp sourceId
              if(data.sourceId) {
                  DetectRTC.screen.sourceId = data.sourceId;
                  if(screenCallback) screenCallback( DetectRTC.screen.sourceId );
              }
          },
          getChromeExtensionStatus: function (callback) {
              if (!!navigator.mozGetUserMedia) return callback('not-chrome');

              var extensionid = 'ajhifddimkapgcifgcodmmfdlknahffk';

              var image = document.createElement('img');
              image.src = 'chrome-extension://' + extensionid + '/icon.png';
              image.onload = function () {
                  DetectRTC.screen.chromeMediaSource = 'screen';
                  window.postMessage('are-you-there', '*');
                  setTimeout(function () {
                      if (!DetectRTC.screen.notInstalled) {
                          callback('installed-enabled');
                      }
                  }, 2000);
              };
              image.onerror = function () {
                  DetectRTC.screen.notInstalled = true;
                  callback('not-installed');
              };
          }
      };

      // check if desktop-capture extension installed.
      if(window.postMessage && isChrome) {
          DetectRTC.screen.isChromeExtensionAvailable();
      }
  })();

  DetectRTC.screen.getChromeExtensionStatus(function(status) {
      if(status == 'installed-enabled') {
          if(document.getElementById('install-button')) {
              document.getElementById('install-button').parentNode.innerHTML = '<strong>Great!</strong> <a href="https://chrome.google.com/webstore/detail/screen-capturing/ajhifddimkapgcifgcodmmfdlknahffk" target="_blank">Google chrome extension</a> is installed.';
          }
          DetectRTC.screen.chromeMediaSource = 'desktop';
      }
  });

  window.addEventListener('message', function (event) {
      if (event.origin != window.location.origin) {
          return;
      }

      DetectRTC.screen.onMessageCallback(event.data);
  });

});//end ready
