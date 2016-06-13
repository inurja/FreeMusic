// Controller

angular.module('YouTubefy')

.controller('googleController', function ($scope, $http, $log, googleService) {

    init();
    var playlistId; //Helper so we can easily get data from VideoInPlaylist table
    $scope.nextPageToken = ""; //YouTubeApi token for loading more search results

    //These are needed so we can databind these elements in HTML
    function init() {
        $scope.youtube = googleService.getYoutube();
        $scope.results = googleService.getResults();
        $scope.playList = googleService.getPlaylist();
    }

    //Call service function to play video
    $scope.playVideo = function (id, title) {
        googleService.loadVideo(id, title);
    };

    //Call service function to add video to custom list
    $scope.addVideoToList = function (id, title) {
        googleService.addVideoToList(id, title);
    };

    //Call service function to remove video from custom list by id
    $scope.removeVideoFromPlaylist = function (id) {
        googleService.removeVideoFromPlaylist(id);
    };

    $scope.logIn = function () {
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
            .then(function (response, data) {
                console.log(response);
                console.log(data);
                //sessionStorage.setItem(tokenKey, data.access_token);
            });
    }

    $scope.createPlaylistDb = function (createPlaylistName) {
        var url = serverUrlForDatabase + '/api/Playlists/AddPlaylist';
        var dataJson = JSON.stringify({ "PlaylistName": createPlaylistName, "UserIntId": 1 });
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
            .success(function (data) {
                $scope.addToVideoInPlaylistDb(data.id, playlistId); //Add connection between playlist and video, playlistId comes if user has active playlist (this id is a global variable which is set when a playlist is searched or created)
            })
            .error(function (status) {
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

    //YouTubeDataApi CALL - search
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

    $scope.checkIfPlaylistExists = function (playlistName) {
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

    $scope.removeFromPlaylist = function (videoId, removeId) { //videoId is youtubeVideoId (string)
        var url = serverUrlForDatabase + '/api/VideoInPlaylists/DeleteVideoInPlaylistsByVideoId/' + removeId; //removeId is primary key (not really, but thats how we gon get it lol)) of the videoInPlaylist entry which we need to remove. Its primary key of Video table object
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

    $scope.removeFromVideoDb = function (removeId) {
        var url = serverUrlForDatabase + '/api/Videos/DeleteVideoById/' + removeId;
        $http.delete(url)
            .success(function (status) {
                console.log("Delete Videos success: ", status);
            })
            .error(function (status) {
                console.log(status);
            });
    }
});