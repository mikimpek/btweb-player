/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/btweb-player.js":
/*!*****************************!*\
  !*** ./src/btweb-player.js ***!
  \*****************************/
/***/ (() => {

document.addEventListener('DOMContentLoaded', function () {
  var socket = new WebSocket("wss://myradio.bibliotehnika.com/api/live/nowplaying/websocket");
  socket.onopen = function (e) {
    socket.send(JSON.stringify({
      "subs": {
        "station:techno_chronicle": {
          "recover": true
        },
        "station:prava": {
          "recover": true
        }
      }
    }));
  };
  function updateWebSocketInfo(data) {
    var _data$station, _data$now_playing, _data$listeners;
    var stationElement = document.querySelector('#ws-station span');
    var nowPlayingElement = document.querySelector('#ws-now-playing span');
    var listenersElement = document.querySelector('#ws-listeners span');
    var liveElement = document.querySelector('#ws-live span');
    var onlineElement = document.querySelector('#ws-online span');
    if (stationElement) stationElement.textContent = ((_data$station = data.station) === null || _data$station === void 0 ? void 0 : _data$station.name) || 'N/A';
    if (nowPlayingElement) nowPlayingElement.textContent = ((_data$now_playing = data.now_playing) === null || _data$now_playing === void 0 || (_data$now_playing = _data$now_playing.song) === null || _data$now_playing === void 0 ? void 0 : _data$now_playing.title) || 'N/A';
    if (listenersElement) listenersElement.textContent = ((_data$listeners = data.listeners) === null || _data$listeners === void 0 ? void 0 : _data$listeners.current) || 'N/A';
    if (liveElement) liveElement.textContent = data.live ? 'Yes' : 'No';
    if (onlineElement) onlineElement.textContent = data.is_online ? 'Yes' : 'No';
  }
  function handleSseData(ssePayload) {
    var useTime = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    var jsonData = ssePayload.data;
    if (useTime && 'current_time' in jsonData) {
      currentTime = jsonData.current_time;
    }
    nowplaying = jsonData.np;

    // Update UI for techno station
    var technoElement = document.getElementById('now-playing-techno');
    if (technoElement && jsonData.np.station && jsonData.np.station.shortcode === 'techno_chronicle') {
      var _jsonData$np$station, _nowPlayingData$song, _nowPlayingData$song2, _nowPlayingData$song3, _jsonData$np$mounts;
      var nowPlayingData = jsonData.np.now_playing || {};
      var stationName = ((_jsonData$np$station = jsonData.np.station) === null || _jsonData$np$station === void 0 ? void 0 : _jsonData$np$station.name) || 'N/A';
      var songTitle = ((_nowPlayingData$song = nowPlayingData.song) === null || _nowPlayingData$song === void 0 ? void 0 : _nowPlayingData$song.title) || 'N/A';
      var artistName = ((_nowPlayingData$song2 = nowPlayingData.song) === null || _nowPlayingData$song2 === void 0 ? void 0 : _nowPlayingData$song2.artist) || 'N/A';
      var albumArt = ((_nowPlayingData$song3 = nowPlayingData.song) === null || _nowPlayingData$song3 === void 0 ? void 0 : _nowPlayingData$song3.art) || '';
      var listeners = jsonData.np.listeners.current || 'N/A';
      var is_online = jsonData.np.is_online ? 'Yes' : 'No';
      var bitrate = ((_jsonData$np$mounts = jsonData.np.mounts) === null || _jsonData$np$mounts === void 0 ? void 0 : _jsonData$np$mounts.bitrate) || 'N/A';
      technoElement.innerHTML = "\n                ".concat(albumArt ? "<img src=\"".concat(albumArt, "\" alt=\"Album Art\" width=\"100\" height=\"100\">") : '', "\n                <div class=\"marquee\">\n                    <p class=\"song-title\"><span>Song:</span> ").concat(songTitle, "</p>\n                </div>\n                <p><span>Artist:</span> ").concat(artistName, "</p>\n                <p><span>Bitrate:</span> ").concat(bitrate, " kbps</p>\n                <p><span>Listeners:</span> ").concat(listeners, "</p>\n                <p><span>Online:</span> ").concat(is_online, "</p>\n                <p><span>Station:</span> ").concat(stationName, "</p>\n            ");
    }

    // Update UI for prava station
    var pravaElement = document.getElementById('now-playing-prava');
    if (pravaElement && jsonData.np.station && jsonData.np.station.shortcode === 'prava') {
      var _nowPlayingData$song4, _nowPlayingData$song5, _nowPlayingData$song6;
      var _nowPlayingData = jsonData.np.now_playing || {};
      var _songTitle = ((_nowPlayingData$song4 = _nowPlayingData.song) === null || _nowPlayingData$song4 === void 0 ? void 0 : _nowPlayingData$song4.title) || 'N/A';
      var _artistName = ((_nowPlayingData$song5 = _nowPlayingData.song) === null || _nowPlayingData$song5 === void 0 ? void 0 : _nowPlayingData$song5.artist) || 'N/A';
      var _albumArt = ((_nowPlayingData$song6 = _nowPlayingData.song) === null || _nowPlayingData$song6 === void 0 ? void 0 : _nowPlayingData$song6.art) || '';
      var _listeners = jsonData.np.listeners.current || 'N/A';
      var _is_online = jsonData.np.is_online ? 'Yes' : 'No';
      pravaElement.innerHTML = "\n                ".concat(_albumArt ? "<img src=\"".concat(_albumArt, "\" alt=\"Album Art\" width=\"100\" height=\"100\">") : '', "\n                <div class=\"marquee\">\n                    <p class=\"song-title\"><span>Song:</span> ").concat(_songTitle, "</p>\n                </div>\n                <p><span>Artist:</span> ").concat(_artistName, "</p>\n                <p><span>Listeners:</span> ").concat(_listeners, "</p>\n                <p><span>Online:</span> ").concat(_is_online, "</p>\n            ");
    }

    // Update the websocket-info section
    updateWebSocketInfo(jsonData.np);
  }
  socket.onmessage = function (e) {
    var jsonData = JSON.parse(e.data);
    if ('connect' in jsonData) {
      var connectData = jsonData.connect;
      if ('data' in connectData) {
        connectData.data.forEach(function (initialRow) {
          return handleSseData(initialRow);
        });
      } else {
        if ('time' in connectData) {
          currentTime = Math.floor(connectData.time / 1000);
        }
        for (var subName in connectData.subs) {
          var sub = connectData.subs[subName];
          if ('publications' in sub && sub.publications.length > 0) {
            sub.publications.forEach(function (initialRow) {
              return handleSseData(initialRow, false);
            });
          }
        }
      }
    } else if ('pub' in jsonData) {
      handleSseData(jsonData.pub);
    }
  };
  socket.onerror = function (e) {
    console.error('WebSocket Error:', e);
  };
});

/***/ }),

/***/ "./src/btweb-player.scss":
/*!*******************************!*\
  !*** ./src/btweb-player.scss ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"/dist/btweb-player": 0,
/******/ 			"dist/btweb-player": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = (chunkId) => (installedChunks[chunkId] === 0);
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunkbtweb_player"] = self["webpackChunkbtweb_player"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	__webpack_require__.O(undefined, ["dist/btweb-player"], () => (__webpack_require__("./src/btweb-player.js")))
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["dist/btweb-player"], () => (__webpack_require__("./src/btweb-player.scss")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;