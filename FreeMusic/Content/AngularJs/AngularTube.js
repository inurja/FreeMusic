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
    var currentlyPlaying;
    var j; //current array object that is playing
 
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

    this.listPlaylistFromDatabase = function (data) {
        playList.length = 0;
        for (j = data.length - 1; j >= 0; j--) {
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
                'onStateChange': onYoutubeStateChange
            },
            videoId: 'Rd8Wez2_j7Y',
            videoTitle: 'Ayy lmao'
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
        console.log(id);
        console.log(youtube.player);
        j = this.findIndexByKeyValue(playList, "title", videoTitle);
        //console.log("j after indexof = ", j);
        youtube.player.loadVideoById(id);
        youtube.videoId = id;
        youtube.videoTitle = videoTitle;
        console.log("Title in load video service function: " + videoTitle);
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

    $scope.createPlaylistDb = function (createPlaylistName) { 
        console.log("createPlaylistDb called");
        //TODO Check if playlist already exists

        var url = 'http://localhost:43467/api/Playlists/AddPlaylist';
        var dataJson = JSON.stringify({ "PlaylistName": createPlaylistName, "UserIntId": 1});
        $http.post(url, dataJson)
            .success(function (data, status) {
                console.log(data);
                console.log(status);
                $scope.activePlaylist = createPlaylistName; //if success, then add this playlist as current active playlist, so user can add videos to it
                playlistId = data.id;
                $scope.getPlaylist(playlistId);
            })
            .error(function (data, status) {
                console.log(data);
                console.log(status);
            });
    }

    $scope.addToVideoDb = function (videoId, videoTitle, playlistName) { //videoId is youtube video id (string)
        console.log("POST called4");
        if (playlistName == null) { //Check if user has active playlist
            alert("No active playlist");
            console.log("return called");
            return;
        }
        var url = 'http://localhost:43467/api/Videos/AddVideo';
        var dataJson = JSON.stringify({ "Title": videoTitle, "YoutubeVideoId": videoId });
        $http.post(url, dataJson)
            .success(function(data, status) {
                console.log("Data from POSTing video to Video db: ", data.id);
                console.log(status);
                $scope.addToVideoInPlaylistDb(data.id, playlistId); //Add connection between playlist and video, playlistId comes if user has active playlist (this id is a global variable which is set when a playlist is searched or created)
            })
            .error(function(data, status) {
                console.log(data);
                console.log(status);
            });
    }

    $scope.addToVideoInPlaylistDb = function (vidId, plistId) { //vidId is PK of where video was inserted in Video table
        console.log("Add VideoInPlaylist called");
        if (plistId == 0) { //Check if user has active playlist
            alert("No active playlist");
            return;
        } else {
            var url = 'http://localhost:43467/api/VideoInPlaylists';
            var dataJson = JSON.stringify({ "PlaylistId": plistId, "VideoId": vidId });
            $http.post(url, dataJson)
                .success(function (data, status) {
                    console.log(data);
                    console.log(status);
                    console.log("Succesfully added VideoInPlaylist????");

                    $scope.getPlaylist(playlistId);
                    //DO SOMETHING
                })
                .error(function (data, status) {
                    console.log(data);
                    console.log(status);
                    //DO SOMETHING
                });
        }
    
    }

    $scope.getVideos = function () {
        console.log("getVideos from Database called");
        $http.get('http://localhost:43467/api/Videos')
        .success(function (data) {
            $log.info("See asi " + data);
            googleService.listPlaylistFromDatabase(data);
        })
        .error(function () {
            $log.info('Search error');
        });
    }


    //YouTubeDataApi CALL
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

    $scope.checkIfPlaylistExists = function(playlistName) {
        console.log("checkIfPlaylistExists called");
        console.log("Playlistname entered: " + playlistName);
        if (playlistName == null) {
            alert("No playlist name entered in Get Playlist");
            return;
        }
        var url = 'http://localhost:43467/api/Playlists/GetPlaylistIdByPlaylistName/';
        $http.get(url + playlistName)
            .success(function (data, status) {
                console.log("Logged data from checkIfPlaylistExists: ", data);
                console.log(status);
                if (data == 0) { //ma miskipärast pidin "null"-ga võrdlema :S
                    alert("No playlist with such name");
                } else {
                    //alert("playlist found (just testing, maybe not found but it passed if test)");
                    playlistId = data; //set ID (primary key) of this playlist name
                    //console.log(playlistId);
                    $scope.activePlaylist = playlistName;
                    $scope.getPlaylist(playlistId);
                }
                
                //DO SOMETHING
            })
            .error(function (data, status) {
                console.log(data);
                console.log(status);
                //DO SOMETHING
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

    $scope.getPlaylist = function (plistId, videoInPlaylistId) {
        googleService.emptyPlaylist(); //empty current playlist (this is local playlist array to show on youtubefy page)
        console.log("getPlaylist called");
        //console.log("Playlistname entered: " + playlistName);
        if (plistId == 0) {
            alert("No playlist playlistId");
            console.log("getPlaylist return called");
            return;
        }
        var url = 'http://localhost:43467/api/VideoInPlaylists/GetAllVideosInPlaylistByPlaylistId/';
        $http.get(url + plistId)
            .success(function (data, status) {
                console.log("Logged data from GetPlaylist: ", data);
                console.log(status);
                if (data == 0) {
                    alert("no return data for playlist");
                } else {
                    //alert("playlist found (just testing, maybe not found but it passed if test)");
                    googleService.listPlaylistFromDatabase(data);
                }

                //DO SOMETHING
            })
            .error(function (data, status) {
                console.log(data);
                console.log(status);
                //DO SOMETHING
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
        console.log("remove called");
        var url = 'http://localhost:43467/api/VideoInPlaylists/DeleteVideoInPlaylistsByVideoId/' + removeId; //removeId is primary key (not really, but thats how we gon get it lol)) of the videoInPlaylist entry which we need to remove. Its primary key of Video playlist object
        $http.delete(url)
            .success(function (data, status) {
                console.log(data);
                console.log("Delete API success: ", status);
                googleService.removeVideoFromPlaylist(videoId);
                $scope.removeFromVideoDb(removeId);
                //DO SOMETHING
            })
            .error(function (data, status) {
                console.log(data);
                console.log(status);
                //DO SOMETHING
            });
    }


    $scope.removeFromVideoDb = function(removeId) {
        console.log("remove from videoDb called");
        var url = 'http://localhost:43467/api/Videos/DeleteVideoById/' + removeId; //removeId is primary key (not really, but thats how we gon get it lol)) of the videoInPlaylist entry which we need to remove. Its primary key of Video playlist object
        $http.delete(url)
            .success(function (data, status) {
                console.log(data);
                console.log("Delete Videos API success: ", status);
                //DO SOMETHING
            })
            .error(function (data, status) {
                console.log(data);
                console.log(status);
                //DO SOMETHING
            });
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