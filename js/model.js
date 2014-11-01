define(['jQuery'], function($) {
	var PlayerModel = function () {
		this.trackListArray = [];
		this.audio = new Audio();
		this.oldTrackPlayed = 0;
		this.trackNrToPlay = 0;
		this.playing = false;
		var me = this;

		$.getJSON('tracklist.json', function(data) {
            data.tracks.forEach(function(track, i){
				track.id = i;
				me.trackListArray.push(track);
				//$.get(track.url).fail(function() {
				//	alert("Cannot find track defined in playlist with trackurl: " + track.url);
				//});
            });
            $(me).trigger(me.events.TRACKLISTLOADED);
        });

		this.events = {
			//CHANGE:'change',
			TRACKLISTLOADED: 'tracklistloaded',
			TIMEUPDATE: 'timeupdate',
			NEWSONG: 'newSong'
		};
		this.setEventListeners();
	};
	PlayerModel.prototype.setEventListeners = function () {
		this.audio.addEventListener('timeupdate', function(e) {
			$(me).trigger(me.events.TIMEUPDATE);
		});

		this.audio.addEventListener('durationchange', function(e) {
			$(me).trigger(me.events.NEWSONG);
		});

		this.audio.addEventListener('loadstart', function(e) {
			$(me).trigger(me.events.NEWSONG);
		});

		this.audio.addEventListener('progress', function(e) {
			if(me.audio.buffered.length) {
				$(me).trigger(me.events.TIMEUPDATE);
			}
		});

		this.audio.addEventListener('ended', function(e) {
			//playhead reached end of audio file
			me.nextTrack();
		});

		/*this.audio.addEventListener('playing', function(e) {
			console.log('playing');
		});*/
		var me = this;
		$(this).on('tracklistloaded', function(e) {
			me.audio.src = me.trackListArray[me.trackNrToPlay].url;
			me.audio.autoplay = false;
			//me.audio.controls = true; //use default controls for demo
			me.audio.preload = 'none'; //auto, metadata
			//window.document.body.appendChild(me.audio);
			//me.audio.style.width = '1000px'; //only debug
		});
	};
	PlayerModel.prototype.getCurrentTrack = function () {
		return this.trackNrToPlay;
	};
	PlayerModel.prototype.getOldTrackPlayed = function () {
		return this.oldTrackPlayed;
	};
	PlayerModel.prototype.dropTrack = function (old, source) {
		this.trackListArray.splice(++source, 0, this.trackListArray[old]);
		this.trackListArray.splice(old,1);
		if(old == this.trackNrToPlay){
			this.oldTrackPlayed = parseInt(this.trackNrToPlay);
			this.trackNrToPlay = parseInt(source)-1;
		}else{
			if(source > this.trackNrToPlay && old < this.trackNrToPlay){
				this.oldTrackPlayed = parseInt(this.trackNrToPlay);
				this.trackNrToPlay = parseInt(this.trackNrToPlay-1);
			}
			if(source < this.trackNrToPlay && old > this.trackNrToPlay){
				this.oldTrackPlayed = parseInt(this.trackNrToPlay);
				this.trackNrToPlay = parseInt(this.trackNrToPlay+1);
			}
		}
	};
	PlayerModel.prototype.getProgress = function () {
		if(this.audio.buffered.length) {
			return this.audio.buffered.end(this.audio.buffered.length-1);
		}else{
			return 0;
		}
		
	};
	PlayerModel.prototype.nextTrack = function () {
		this.oldTrackPlayed = this.trackNrToPlay;
		if (typeof this.trackListArray[this.trackNrToPlay+1] === 'undefined'){
			this.trackNrToPlay = 0;
			this.stop();
		}else{
			this.trackNrToPlay += 1;
		}
		this.audio.src = this.trackListArray[this.trackNrToPlay].url;
		if (this.playing === true){
			this.audio.addEventListener('loadstart', function(e) {
				this.play();
			});
		}else{
			this.audio.addEventListener('loadstart', function(e) {
				this.pause();
			});
		}
	};
	PlayerModel.prototype.previousTrack = function () {
		this.oldTrackPlayed = this.trackNrToPlay;
		if (typeof this.trackListArray[this.trackNrToPlay-1] === 'undefined'){
			this.trackNrToPlay = this.trackListArray.length-1;
		}else{
			this.trackNrToPlay -= 1;
		}
		this.audio.src = this.trackListArray[this.trackNrToPlay].url;
		if (this.playing === true){
			this.audio.addEventListener('loadstart', function(e) {
				this.play();
			});
		}else{
			this.audio.addEventListener('loadstart', function(e) {
				this.pause();
			});
		}
	};
	PlayerModel.prototype.stop = function () {
		if(this.audio.currentTime !== 0){
			this.audio.currentTime = 0;
		}
		this.pause();
	};
	PlayerModel.prototype.pause = function () {
		this.playing = false;
		this.audio.pause();
	};
	PlayerModel.prototype.play = function () {
		this.playing = true;
		this.audio.play();
	};
	PlayerModel.prototype.playSongWithId = function (id) {
		this.oldTrackPlayed = parseInt(this.trackNrToPlay);
		this.trackNrToPlay = parseInt(id);
		this.audio.src = this.trackListArray[id].url;
		this.audio.addEventListener('loadstart', function(e) {
			this.play();
		});
	};
	PlayerModel.prototype.getDuration = function () {
		return this.audio.duration;
	};
	PlayerModel.prototype.setTime = function (newTime) {
		this.audio.currentTime = newTime;
	};
	PlayerModel.prototype.setVolume = function (newVolume) {
		this.audio.volume = newVolume;
	};
	PlayerModel.prototype.getTimeLeft = function (position) {
		return (this.audio.duration-this.audio.currentTime);
	};
	PlayerModel.prototype.getCurrentTime = function (position) {
		return this.audio.currentTime;
	};
	PlayerModel.prototype.getTrackInfo = function () {
		return this.trackListArray[this.trackNrToPlay];
	};
	PlayerModel.prototype.getPlayList = function () {
		return this.trackListArray;
	};

	return PlayerModel;

});
