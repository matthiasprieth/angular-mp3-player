mp3PlayerApp.directive('trackinfoview', [function () {
    return {
        restrict: 'E',

        link: function ($scope, element, attrs) {

        },
        controller: function ($scope) {
            $scope.renderTrackInfoView = function () {
                var currentTrackInfo = $scope.getTrackInfo();
                $scope.trackTitle = currentTrackInfo.title;
                $scope.trackArtist = currentTrackInfo.artist;
                $scope.trackGenre = currentTrackInfo.genre;
                $scope.trackAlbum = currentTrackInfo.album;
                $scope.$apply();
            };
        },
        templateUrl: 'template/trackInfo.html',
        replace: true
    };
}]);

mp3PlayerApp.directive('timelineview', [function () {
    return {
        restrict: 'E',

        link: function ($scope, element, attrs) {
            timeLineView = $('#timeLineView');
            $time = $('#time');
            $timeLeft = $('#timeLeft');

            timeLineView.model = new components.ProgressSlider({
                view: timeLineView,
                min: parseFloat(timeLineView.attr('data-min')),
                max: parseFloat(timeLineView.attr('data-max')),
                value: parseFloat(timeLineView.attr('data-value'))
            });

            $(timeLineView.model).on('change', function () {
                $scope.setTime(timeLineView.model.getValue());
            });

        },
        controller: function ($scope) {
            $scope.secondsToTime = function (secs) {
                var hours = Math.floor(secs / (60 * 60));
                var divisor_for_minutes = secs % (60 * 60);
                var minutes = Math.floor(divisor_for_minutes / 60);
                var divisor_for_seconds = divisor_for_minutes % 60;
                var seconds = Math.ceil(divisor_for_seconds);
                return ((hours < 10 ? '0' + hours : hours) +
                    ':' + (minutes < 10 ? '0' + minutes : minutes) +
                    ':' + (seconds < 10 ? '0' + seconds : seconds));
            };
            $scope.renderTimeLineView = function () {
                timeLineView.model.setValueNoTrigger($scope.getCurrentTime());
                timeLineView.model.setBufferedValue($scope.getProgress());

                $scope.time = $scope.secondsToTime($scope.getCurrentTime());
                if (isNaN($scope.getTimeLeft())) {
                    $scope.timeLeft = '00:00:00';
                } else {
                    $scope.timeLeft = $scope.secondsToTime($scope.getTimeLeft());
                }
                $scope.$apply();
            };
            $scope.renderNewTimeLineView = function () {
                timeLineView.model.max = $scope.getDuration();
                $scope.renderTimeLineView();
            };
        },
        templateUrl: 'template/timeLine.html',
        replace: true
    };
}]);

mp3PlayerApp.directive('playercontrolsview', [function () {
    return {
        restrict: 'E',

        link: function ($scope, element, attrs) {

        },
        controller: function ($scope) {
            $scope.playOrPause = function () {
                if ($scope.isPlaying() === true) {
                    $scope.pause();
                    $scope.addPlayButton();

                } else {
                    $scope.play();
                    $scope.addPauseButton();
                }
            };
            $scope.addPlayButton = function () {
                $('#playOrPausebtn i').removeClass('icon-pause icon-white');
                $('#playOrPausebtn i').addClass('icon-play icon-white');
            };
            $scope.addPauseButton = function () {
                $('#playOrPausebtn i').removeClass('icon-play icon-white');
                $('#playOrPausebtn i').addClass('icon-pause icon-white');
            };
            $scope.shufflePlaylist = function () {
                if ($scope.isShuffled() === true) {
                    $scope.resetTrackList();
                    $scope.addShuffleButton();
                } else {
                    $scope.shuffleTrackList();
                    $scope.addNormalButton();
                }
            };
            $scope.addNormalButton = function () {
                $('#shufflebtn i').removeClass('icon-random icon-white');
                $('#shufflebtn i').addClass('icon-retweet icon-white');
            };
            $scope.addShuffleButton = function () {
                $('#shufflebtn i').removeClass('icon-retweet icon-white');
                $('#shufflebtn i').addClass('icon-random icon-white');
            };
        },
        templateUrl: 'template/playerControls.html',
        replace: true
    };
}]);

mp3PlayerApp.directive('volumesliderview', [function () {
    return {
        restrict: 'E',

        link: function ($scope, element, attrs) {
            $volumeSliderView = $('#volumeView');

            $volumeSliderView.model = new components.VolumeSlider({
                view: $volumeSliderView,
                min: parseFloat($volumeSliderView.attr('data-min')),
                max: parseFloat($volumeSliderView.attr('data-max')),
                value: parseFloat($volumeSliderView.attr('data-value'))
            });

            $($volumeSliderView.model).on("change", function () {
                $scope.setVolume($volumeSliderView.model.getValue());
            });
        },
        controller: function ($scope) {
            $scope.muteOrUnmuteBtn = function (e) {
                if ($scope.isMuted() === true) {
                    $scope.setVolume($volumeSliderView.model.getValue());
                    $scope.setUnMuteButton();
                }
                else {
                    $scope.setVolume(0);
                    $scope.setMuteButton();
                }
            };
            $scope.setMuteButton = function (e) {
                $('#btnVolume').removeClass('icon-volume-up');
                $('#btnVolume').addClass('icon-volume-off');
            };
            $scope.setUnMuteButton = function (e) {
                $('#btnVolume').removeClass('icon-volume-off');
                $('#btnVolume').addClass('icon-volume-up');
            };
        },
        templateUrl: 'template/volumeSlider.html',
        replace: true
    };
}]);

mp3PlayerApp.directive('tracklistview', [function () {
    return {
        restrict: 'E',

        link: function ($scope, element, attrs) {
            trackListView = $('#trackListView');
        },
        controller: function ($scope) {
            $scope.renderTrackListView = function () {
                function handleDragStart(e) {
                    dragSrcEl = this;
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('text/html', this.innerHTML);
                }

                function handleDragOver(e) {
                    if (e.preventDefault) {
                        e.preventDefault(); // Necessary. Allows us to drop.
                    }
                    e.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.
                    return false;
                }

                function handleDragEnter(e) {
                    this.classList.add('over');
                }

                function handleDragLeave(e) {
                    this.classList.remove('over');  // this / e.target is previous target element.
                }

                function handleDrop(e) {
                    // this/e.target is current target element.
                    this.classList.remove('over');
                    //does not work
                    if (e.stopPropagation) {
                        e.stopPropagation(); // Stops some browsers from redirecting.
                    }
                    // Don't do anything if dropping the same column we're dragging.
                    if (dragSrcEl != this) {
                        // Set the source column's HTML to the HTML of the columnwe dropped on.
                        //dragSrcEl.innerHTML = this.innerHTML;
                        var sourceIndex = $(this).index();
                        var draggedIndex = $(dragSrcEl).index();
                        $scope.dropTrack(draggedIndex, sourceIndex);

                        $(this).after(dragSrcEl);

                        $scope.setTrackNrToPlay(trackListView.children('.activeTrack').index());
                    }

                    return false;
                }

                for (var i in $scope.getPlayList()) {
                    trackListView[0].children[i].addEventListener('dragstart', handleDragStart, false);
                    trackListView[0].children[i].addEventListener('dragenter', handleDragEnter, false);
                    trackListView[0].children[i].addEventListener('dragover', handleDragOver, false);
                    trackListView[0].children[i].addEventListener('dragleave', handleDragLeave, false);
                    trackListView[0].children[i].addEventListener('drop', handleDrop, false);
                }

            };
            $scope.setActiveTrackInTrackListView = function () {
                for (var i in $scope.getPlayList()) {
                    trackListView[0].children[i].classList.remove('activeTrack');
                }
                trackListView[0].children[$scope.getTrackNrToPlay()].classList.add('activeTrack');
            };
        },
        templateUrl: 'template/trackList.html',
        replace: true
    };
}]);




