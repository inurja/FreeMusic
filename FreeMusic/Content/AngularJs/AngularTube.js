var app = angular.module('YouTubefy', []);

//Build the youtube player in html placeholder
app.run(function () {
    var tag = document.createElement('script');
    tag.src = "http://www.youtube.com/iframe_api"; //get code for player
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
});

// Service

app.service('googleService', ['$window', function ($window) {

    var service = this;
    var results = [];
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
            videoId: 'Rd8Wez2_j7Y',
            videoTitle: 'Ayy lmao'
        });
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
    this.loadVideo = function (id, title) {
        console.log(id);
        console.log(youtube.player);
        youtube.player.loadVideoById(id);
        youtube.videoId = id;
        youtube.videoTitle = title;
        console.log("Title in load video service function: " + title);
        console.log("Youtube.videoTitle in load video service function: " + youtube.videoTitle);
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
        //console.log("list: " + list);
        for (var i = 0; i <= list.length - 1; i++) {
            //console.log("list index " + i + " element: " + list[i]);
            if (list[i].id === id) {
                console.log("If condition True, splice and break, Video REMOVED from playlist");
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

}]);

// Controller

app.controller('googleController', function ($scope, $http, $log, googleService) {

    init();

    function init() {
        $scope.results = googleService.getResults();
        $scope.playList = googleService.getPlaylist();
    }

    //Call service function to play video
    $scope.playVideo = function (id, title) {
       googleService.loadVideo(id, title); 
    };

    //Call service function to add video to custom list
    $scope.addVideoToList = function(id, title) {
        googleService.addVideoToList(id, title);
    };

    //Call service function to remove video from custom list by id
    $scope.removeVideoFromPlaylist = function(id) {
        googleService.removeVideoFromPlaylist(id);
        console.log("Delete video ID: " + id);
    };

    $scope.logIn = function() {
        var url = 'http://localhost:43467/Token';
        //var loginData = 'grant_type=password&username=1@eesti.ee&password=a';
        var loginData = {
            grant_type: 'password',
            username: "1@eesti.ee",
            password: "a"
        };
        var data =
        //var tokenKey = "";
        $http({
                method: 'POST',
                url: url,
                data: $.param({
                    grant_type: "password",
                    username: "1@eesti.ee",
                    password: "a"
                }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }
            })
            .then(function(response, data) {
                console.log(response);
                console.log(data);
                //sessionStorage.setItem(tokenKey, data.access_token);
            });

    }

    $scope.addToDatabase = function () {
        console.log("POST called4");
        var cors = new XMLHttpRequest();
        var url = 'http://localhost:43467/api/Videos'
        var data =
            '<?xml version="1.0"?><VideoDTO><Title>Client post test</Title><YoutubeVideoId>YS-5oD2Y4Wk</YoutubeVideoId></VideoDTO>';
        var dataJson = JSON.stringify({ "Title": "Allahu akbar2", "YoutubeVideoId": "dalfjh-5Da" });
        $http.post(url, dataJson)
            .success(function(data, status) {
                console.log(data);
                console.log(status);
            })
            .error(function(data, status) {
                console.log(data);
                console.log(status);
            });
        /*if (cors) {
            cors.open('POST', url, true);
            cors.setRequestHeader('X-PINGOTHER', 'pingpong');
            //cors.setRequestHeader("Access-Control-Allow-Origin: *");
            cors.setRequestHeader('Content-Type', 'application/xml');
            //cors.onreadystatechange = handler;
            cors.send(data);
        }*/

        $http({
            method: 'POST',
            url: 'http://localhost:43467/api/Videos'
        }).then(function successCallback(response) {
            // this callback will be called asynchronously
            // when the response is available
        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
    }

    $scope.search = function (isNewQuery) {
        console.log("Search called");
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