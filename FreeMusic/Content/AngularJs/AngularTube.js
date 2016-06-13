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

// Controller

app.controller('googleController', function ($scope, $http, $log, googleService) {

    init();
    var playlistId;
    $scope.nextPageToken = "";

    function init() {
        $scope.youtube = googleService.getYoutube();
        $scope.results = googleService.getResults();
        $scope.playList = googleService.getPlaylist();
    }

    //Call service function to play video
    $scope.playVideo = function (id, title) {
        googleService.loadVideo(id, title);
        $scope.currentlyPlaying = title;
    };

    //Call service function to add video to custom list
    $scope.addVideoToList = function(id, title) {
        googleService.addVideoToList(id, title);
    };

    //Call service function to remove video from custom list by id
    $scope.removeVideoFromPlaylist = function(id) {
        googleService.removeVideoFromPlaylist(id);
    };

    $scope.logIn = function() {
        var url = serverUrlForDatabase + '/Token';
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

    $scope.createPlaylistDb = function (createPlaylistName) { 
        var url = serverUrlForDatabase + '/api/Playlists/AddPlaylist';
        var dataJson = JSON.stringify({ "PlaylistName": createPlaylistName, "UserIntId": 1});
        $http.post(url, dataJson)
            .success(function (data) {
                $scope.activePlaylist = createPlaylistName; //if success, then add this playlist as current active playlist, so user can add videos to it
                playlistId = data.id;
                $scope.getPlaylist(playlistId);
            })
            .error(function (status) {
                console.log(status);
                alert("Playlist already exists, please choose a different name");
            });
    }

    $scope.addToVideoDb = function (videoId, videoTitle, playlistName) { //videoId is youtube video id (string)
        if (playlistName == null) { //Check if user has active playlist
            alert("No active playlist");
            return;
        }
        var url = serverUrlForDatabase + '/api/Videos/AddVideo';
        var dataJson = JSON.stringify({ "Title": videoTitle, "YoutubeVideoId": videoId });
        $http.post(url, dataJson)
            .success(function(data) {
                $scope.addToVideoInPlaylistDb(data.id, playlistId); //Add connection between playlist and video, playlistId comes if user has active playlist (this id is a global variable which is set when a playlist is searched or created)
            })
            .error(function(status) {
                console.log(status);
            });
    }

    $scope.addToVideoInPlaylistDb = function (vidId, plistId) { //vidId is PK of where video was inserted in Video table
        if (plistId == 0) { //Check if user has active playlist
            alert("No active playlist");
            return;
        } else {
            var url = serverUrlForDatabase + '/api/VideoInPlaylists';
            var dataJson = JSON.stringify({ "PlaylistId": plistId, "VideoId": vidId });
            $http.post(url, dataJson)
                .success(function (status) {
                    console.log(status);
                    $scope.getPlaylist(playlistId);
                })
                .error(function (status) {
                    console.log(status);
                });
        }
    }

    //YouTubeDataApi CALL
    $scope.search = function (isNewQuery) {
        console.log("Search called");
        if (this.query != "") {
            savedQuery = this.query; //query from search input field, needed if user deletes search query and we need to load more results
        }
        console.log("savedQuery is: ", savedQuery);
        console.log("giving token: ", $scope.nextPageToken);
        $http.get('https://www.googleapis.com/youtube/v3/search', { //GET request to this address
            params: {
                key: 'AIzaSyCuoHE6u2wQN5UY9JiI7z8qufPhXtU4FnY', //authorization key to allow access to youtube data api
                type: 'video',  //ask for videos
                maxResults: '8', //return this number of videos
                pageToken: isNewQuery ? '' : $scope.nextPageToken, //which page are we at pageToken: isNewQuery ? '' : $scope.nextPageToken,
                part: 'id,snippet', //response
                fields: 'items(id/videoId,snippet(channelTitle,thumbnails,title)),nextPageToken',
                q: savedQuery //string to be searched from youtube
            }
        })
        .success(function (data) {
                googleService.listResults(data, !isNewQuery); //add results to array
                console.log(data);
                $scope.nextPageToken = data.nextPageToken;
            })
        .error(function () {
                console.log("search error");
            });
    }

    $scope.checkIfPlaylistExists = function(playlistName) {
        if (playlistName == null) {
            alert("No playlist name entered in Get Playlist");
            return;
        }
        var url = serverUrlForDatabase + '/api/Playlists/GetPlaylistIdByPlaylistName/' + playlistName;
        $http.get(url)
            .success(function (data, status) {
                console.log(status);
                if (data == 0) {
                    alert("No playlist with such name");
                } else {
                    playlistId = data; //set ID (primary key) of this playlist name
                    $scope.activePlaylist = playlistName;
                    $scope.getPlaylist(playlistId);
                }
            })
            .error(function (status) {
                console.log(status);
            });
    }

    $scope.getPlaylist = function (plistId) {
        googleService.emptyPlaylist(); //empty current playlist (this is local playlist array to show on youtubefy page)
        if (plistId == 0) {
            alert("No playlist playlistId");
            return;
        }
        var url = serverUrlForDatabase + '/api/VideoInPlaylists/GetAllVideosInPlaylistByPlaylistId/' + plistId;
        $http.get(url)
            .success(function (data, status) {
                console.log(status);
                if (data == 0) {
                    alert("no return data for playlist");
                } else {
                    googleService.listPlaylistFromDatabase(data);
                }
            })
            .error(function (data, status) {
                console.log(status);
            });
        /*$http.get('https://www.googleapis.com/youtube/v3/playlists',
        {
            params: {
                key: 'AIzaSyCuoHE6u2wQN5UY9JiI7z8qufPhXtU4FnY',
                part: 'snippet',
                maxResults: '8'
            }
        });*/
    }

    $scope.removeFromPlaylist = function(videoId, removeId) { //videoId is youtubeVideoId (string)
        var url = serverUrlForDatabase + '/api/VideoInPlaylists/DeleteVideoInPlaylistsByVideoId/' + removeId; //removeId is primary key (not really, but thats how we gon get it lol)) of the videoInPlaylist entry which we need to remove. Its primary key of Video playlist object
        $http.delete(url)
            .success(function (data, status) {
                console.log("Delete success: ", status);
                googleService.removeVideoFromPlaylist(videoId);
                $scope.removeFromVideoDb(removeId);
            })
            .error(function (data, status) {
                console.log(status);
            });
    }

    $scope.removeFromVideoDb = function(removeId) {
        var url = serverUrlForDatabase + '/api/Videos/DeleteVideoById/' + removeId; //removeId is primary key (not really, but thats how we gon get it lol)) of the videoInPlaylist entry which we need to remove. Its primary key of Video playlist object
        $http.delete(url)
            .success(function (status) {
                console.log("Delete Videos success: ", status);
            })
            .error(function (status) {
                console.log(status);
                //DO SOMETHING
            });
    }

    $scope.bindCurrentlyPlaying = function() {
        $scope.currentlyPlaying = googleService.currentlyPlaying;
    }
    /*
    $scope.FUNCTIONNAME = function (INPUT) { //VideoId is number, not actual youtube video id as string
        console.log("log message here");
        var url;
        var dataJson = JSON.stringify({});
        $http.post(url, dataJson)
            .success(function (data, status) {
                console.log(data);
                console.log(status);
                //DO SOMETHING
            })
            .error(function (data, status) {
                console.log(data);
                console.log(status);
                //DO SOMETHING
            });
    }
    */
});