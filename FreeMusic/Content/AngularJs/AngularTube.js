var app = angular.module('YouTubefy', []);

//Build the youtube player in html placeholder
app.run(function () {
    var tag = document.createElement('script');
    tag.src = "http://www.youtube.com/iframe_api"; //get code for player
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
});

// Service

app.service('googleService', ['$window', function ($window, $log) {

    var service = this;
    var results = [];
    var youtube = {
        ready: false,
        player: null,
        playerId: null,
        videoId: null,
        videoTitle: null,
        playerHeight: '390',
        playerWidth: '640'
    };

    this.listResults = function (data) {
        results.length = 0;
        for (var i = data.items.length - 1; i >= 0; i--) {
            results.push({
                id: data.items[i].id.videoId,
                title: data.items[i].snippet.title,
                description: data.items[i].snippet.description,
                thumbnail: data.items[i].snippet.thumbnails.default.url,
                author: data.items[i].snippet.channelTitle
            });
        }
        return results;
    }

    //Called when Iframe API is loaded
    $window.onYouTubeIframeAPIReady = function() {
        youtube.ready = true; //set status to ready
        service.bindPlayer('placeholder'); //show where to insert the Iframe player
        service.loadPlayer();
    }

    //construct the youtube player
    this.createPlayer = function () {
        return new YT.Player(youtube.playerId, //create player using API
        {
            height: youtube.playerHeight,
            width: youtube.playerWidth,
            videoId: 'Rd8Wez2_j7Y'
        });
    }

    //Function to load the player, also removes old player
    this.loadPlayer = function() {
        if (youtube.ready && youtube.playerId) { //if ready and playerId is set
            if (youtube.player) { //if there already is a player
                youtube.player.destroy(); //destroy current
            } else {
                youtube.player = service.createPlayer(); //call out method to create new one
            }
        }
    };


    //Call out API function to load video by it's ID
    this.loadVideo = function (id) {
        youtube.player.loadVideoById(id);
        youtube.videoId = id;
    }

    //function to bind youtube player with elementId
    this.bindPlayer = function(elementId) {
        youtube.playerId = elementId;
    }

    this.getResults = function () {
        return results;
    };

}]);

// Controller

app.controller('googleController', function ($scope, $http, $log, googleService) {

    init();

    function init() {
        $scope.results = googleService.getResults();
    }

    $scope.playVideo = function (id) {
        
        if (id) {
            googleService.loadVideo(id); 
        }
             
        
        
    };


    $scope.search = function (isNewQuery) {
        $http.get('https://www.googleapis.com/youtube/v3/search', { //GET request to this address
            params: {
                key: 'AIzaSyCuoHE6u2wQN5UY9JiI7z8qufPhXtU4FnY', //authorization key to allow access to youtube data api
                type: 'video',  //ask for videos
                maxResults: '8', //return this number of videos
                pageToken: isNewQuery ? '' : $scope.nextPageToken, //which page are we at
                part: 'id,snippet', //response
                fields: 'items/id,items/snippet/title,items/snippet/description,items/snippet/thumbnails/default,items/snippet/channelTitle,nextPageToken',
                q: this.query //string to be searched from youtube
            }
        })
        .success(function (data) {
            googleService.listResults(data);
            $log.info(data);
        })
        .error(function () {
            $log.info('Search error');
        });
    }

    $scope.getPlaylist = function() {
        $http.get('https://www.googleapis.com/youtube/v3/playlists',
        {
            params: {
                key: 'AIzaSyCuoHE6u2wQN5UY9JiI7z8qufPhXtU4FnY',
                part: 'snippet',
                maxResults: '8'
            }
        });
    }
});