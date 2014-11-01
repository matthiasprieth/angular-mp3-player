mp3PlayerApp.controller('PlayerCtrl', ['$scope', function ($scope, $timeout) {

    // ======= private ========

    var audio = new Audio();
    var trackNrToPlay = 0;
    var muted = false;
    var playing = false;
    var shuffle = false;
    var trackList = [];
    var shuffledTrackList = [];

    $.getJSON('tracklist.json', function (data) {
        data.tracks.forEach(function (track, i) {
            track.id = i;
            trackList.push(track);
        });
        audio.src = trackList[trackNrToPlay].url;
        audio.autoplay = false;
        audio.preload = 'none'; //auto, metadata
    });

    audio.addEventListener('loadstart', function (e) {
        $scope.renderNewTimeLineView();
        $scope.renderTrackListView();
        $scope.renderTrackInfoView();
        $scope.setActiveTrackInTrackListView();
    });
    audio.addEventListener('durationchange', function (e) {
        $scope.renderNewTimeLineView();
        $scope.renderTrackInfoView();
        $scope.setActiveTrackInTrackListView();
    });
    audio.addEventListener('timeupdate', function (e) {
        $scope.renderTimeLineView();
    });
    audio.addEventListener('progress', function (e) {
        if (audio.buffered.length) {
            $scope.renderTimeLineView();
        }
    });
    audio.addEventListener('ended', function (e) {
        //playhead reached end of audio file
        $scope.nextTrack();
    });

    // ======= public/controller ========

    $scope.getTrackNrToPlay = function () {
        return trackNrToPlay;
    };
    $scope.setTrackNrToPlay = function (newTrackNr) {
        trackNrToPlay = newTrackNr;
    };
    $scope.dropTrack = function (old, source) {
        trackList.splice(++source, 0, trackList[old]);
        if (old > source) {
            trackList.splice(++old, 1);
        } else {
            trackList.splice(old, 1);
        }
    };
    $scope.getProgress = function () {
        if (audio.buffered.length) {
            return audio.buffered.end(audio.buffered.length - 1);
        } else {
            return 0;
        }
    };
    $scope.nextTrack = function () {
        if (shuffle == true) {
            trackNrToPlay = shuffledTrackList[0];
            var element = shuffledTrackList[0];
            shuffledTrackList[shuffledTrackList.length] = parseInt(element);
            shuffledTrackList.shift();
        } else {
            if (typeof trackList[trackNrToPlay + 1] === 'undefined') {
                trackNrToPlay = 0;
                $scope.stop();
            } else {
                trackNrToPlay += 1;
            }
        }
        audio.src = trackList[trackNrToPlay].url;
        if (playing === true) {
            audio.addEventListener('loadstart', function (e) {
                $scope.play();
            });
        }else{
            audio.addEventListener('loadstart', function (e) {
                $scope.pause();
            });
        }
    };
    $scope.previousTrack = function () {
        if (shuffle == true) {
            trackNrToPlay = shuffledTrackList[0];
            var element = shuffledTrackList[0];
            shuffledTrackList[shuffledTrackList.length] = parseInt(element);
            shuffledTrackList.shift();
        } else {
            if (typeof trackList[trackNrToPlay - 1] === 'undefined') {
                trackNrToPlay = trackList.length - 1;
            } else {
                trackNrToPlay -= 1;
            }
        }
        audio.src = trackList[trackNrToPlay].url;
        if (playing === true) {
            audio.addEventListener('loadstart', function (e) {
                $scope.play();
            });
        }else{
            audio.addEventListener('loadstart', function (e) {
                $scope.pause();
            });
        }
    };
    $scope.stop = function () {
        if (audio.currentTime !== 0) {
            audio.currentTime = 0;
        }
        $scope.pause();
        $scope.addPlayButton();
    };
    $scope.pause = function () {
        playing = false;
        audio.pause();
    };
    $scope.play = function () {
        playing = true;
        audio.play();
    };
    $scope.playSongWithId = function (id) {
        trackNrToPlay = parseInt(id);
        audio.src = trackList[id].url;
        audio.addEventListener('loadstart', function (e) {
            playing = false;
            $scope.playOrPause();
        });
    };
    $scope.getDuration = function () {
        return audio.duration;
    };
    $scope.setTime = function (newTime) {
        audio.currentTime = newTime;
    };
    $scope.setVolume = function (newVolume) {
        if (newVolume == 0) {
            muted = true;
            $scope.setMuteButton();
        } else {
            muted = false;
            $scope.setUnMuteButton();
        }
        audio.volume = newVolume;
    };
    $scope.getTimeLeft = function () {
        return (audio.duration - audio.currentTime);
    };
    $scope.getCurrentTime = function () {
        return audio.currentTime;
    };
    $scope.getTrackInfo = function () {
        return trackList[trackNrToPlay];
    };
    $scope.getPlayList = function () {
        return trackList;
    };
    $scope.isPlaying = function () {
        return playing;
    };
    $scope.isMuted = function () {
        return muted;
    };
    $scope.shuffleTrackList = function () {
        shuffle = true;
        var shuffleArray = _.shuffle(trackList);
        for (var i in shuffleArray) {
            shuffledTrackList[i] = shuffleArray[i].id;
        }
    };
    $scope.resetTrackList = function () {
        shuffle = false;
    };
    $scope.isShuffled = function () {
        return shuffle;
    };
    $scope.getTrackList = function () {
        return trackList;
    };

}]);


