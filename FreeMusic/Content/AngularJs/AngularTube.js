var app = angular.module('YouTubefy', []);
var serverUrlForDatabase = 'http://localhost:43467';

//Build the youtube player in html placeholder
app.run(function () {
    var tag = document.createElement('script');
    tag.src = "http://www.youtube.com/iframe_api"; //get code for player
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
});

// Service

app.service('googleService', ['$window', '$rootScope', function ($window, $rootScope) {

    var service = this;
    var results = [];
    var j; //current array object that is playing
    var savedQuery;
 
    var youtube = {
        ready: false,
        player: null,
        playerId: null,
        videoId: null,
        videoTitle: null,
        playerHeight: '450',
        playerWidth: '100%'
    };
    var playList = [
        //{id: 'someId', title: 'someTitle'}
    ];

    this.listResults = function (data, append) {
        if (!append) { //check if we should add search results to old ones (load more videos) or clear
            results.length = 0;
        }
        for (var i = 0; i <= data.items.length - 1; i++) { // for (var i = data.items.length - 1; i >= 0; i--) {
            results.push({
                id: data.items[i].id.videoId,
                title: data.items[i].snippet.title,
                thumbnail: data.items[i].snippet.thumbnails.default.url,
                author: data.items[i].snippet.channelTitle
            });
        }
        return results;
    }

    this.listPlaylistFromDatabase = function (data) {
        playList.length = 0;
        for (j = 0; j <= data.length - 1; j++) { //for (j = data.length - 1; j >= 0; j--) {
            //console.log("LIST THING I NEED TO SEE RIGHNT NOW", data);
            playList.push({
                id: data[j].YoutubeVideoId,
                title: data[j].Title,
                removeId: data[j].VideoId
            });
        }
        return playList;
    }

    //Called when Iframe API is loaded
    $window.onYouTubeIframeAPIReady = function() {
        youtube.ready = true; //set status to ready
        service.bindPlayer('placeholder'); //show where to insert the Iframe player
        service.loadPlayer();
    }

    function onYoutubeReady(event) {
        youtube.videoTitle = "-";
    }

    //construct the youtube player
    this.createPlayer = function () {
        return new YT.Player(youtube.playerId, //create player using API
        {
            height: youtube.playerHeight,
            width: youtube.playerWidth,
            playerVars: {
                iv_load_policy: 3,
                rel: 0,
                showinfo: 0
            },
            events: {
                'onStateChange': onYoutubeStateChange,
                'onReady': onYoutubeReady
            }
            //videoId: 'Rd8Wez2_j7Y',
            //videoTitle: 'Ayy lmao'
        });
    }

    function onYoutubeStateChange(event) {
        if (event.data == YT.PlayerState.PLAYING) {
            console.log("Player playing");
        } else if (event.data == YT.PlayerState.PAUSED) {
            console.log("Player paused");
        } else if (event.data == YT.PlayerState.ENDED) {
            console.log("Player ended");
            console.log("j = ", j);
            j = j + 1;
            if (playList.length - 1 < j) {
                return;
            }      
            service.loadVideo(playList[j].id, playList[j].title);
            console.log("j = ", j);
            console.log("ARRAY THING I NEED TO SEE", playList[j].title);
        }
        $rootScope.$apply(); //needed to update the data binding for HTML currently playing element
    }

    //Function to load the player, also removes old player
    this.loadPlayer = function() {
        if (youtube.ready && youtube.playerId) { //if ready and playerId is set
            if (youtube.player) { //if there already is a player
                youtube.player.destroy(); //destroy current
            } else {
                youtube.player = service.createPlayer(); //call out method to create new one and assign the object to player
                console.log(youtube.player);
            }
        }
    };


    //Call out API function to load video by it's ID and set title so we can show currently playing in html somewhere big
    this.loadVideo = function (id, videoTitle) {
        j = this.findIndexByKeyValue(playList, "title", videoTitle); //helps out with finding what to play next in playlist
        youtube.player.loadVideoById(id);
        youtube.videoId = id;
        youtube.videoTitle = videoTitle;
        return youtube;
    }

    //function to bind youtube player with elementId
    this.bindPlayer = function(elementId) {
        youtube.playerId = elementId;
    }

    this.addVideoToList = function(id, title) {
        playList.push({
            id: id,
            title: title
        });
        return playList;
    }

    //function to remove video from our custom playlist by youtube videoId
    this.removeVideoFromPlaylist = function (id) {
        var list = this.getPlaylist();
        for (var i = 0; i <= list.length - 1; i++) {
            if (list[i].id === id) {
                list.splice(i, 1); //splice i = where to remove, 1 = how many to remove, optional params in end to add new elements
                break;
            }
        }
    };

    this.getResults = function () {
        return results;
    };

    this.getPlaylist = function() {
        return playList;
    }

    this.getYoutube = function() {
        return youtube;
    }

    this.emptyPlaylist = function() {
        playList.length = 0;
    }

    this.findIndexByKeyValue = function(arr, key, value)
    {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i][key] == value) {
                return i;
            }
        }
        return null;
    }

}]);