<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Test.aspx.cs" Inherits="FreeMusic.Test" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<script src="http://ajax.googleapis.com/ajax/libs/angularjs/1.4.8/angular.min.js"></script>
<head runat="server">
    <title></title>
    <style type="text/css">
        #player {
            width: 952px;
        }
    </style>
</head>
<body data-ng-app="YouTubefy">
    <form id="form1" runat="server">
        <div>
            YouTube data API<br />
            <br />
            Video ID:
        <asp:TextBox ID="textBoxVideoID" runat="server" Width="249px"></asp:TextBox>
            <asp:Button ID="btnGetDataByID" runat="server" Text="Get data" OnClick="btnGetDataByID_Click" />
            <br />
            <br />
            Video title:
        <asp:Label ID="labelTitle" runat="server"></asp:Label>
            <br />
            Published on:
        <asp:Label ID="labelPublishDate" runat="server"></asp:Label>

        </div>
        <asp:Panel ID="panelVideoInfo" runat="server">
        </asp:Panel>
        <br />
        <br />
        Enter Playlist ID:
        <asp:TextBox ID="textBoxPlaylistID" runat="server" Width="211px"></asp:TextBox>
        <asp:Button ID="btnGetPlaylist" runat="server" OnClick="btnGetPlaylist_Click" Text="Get Playlist" />
        <br />
        <br />
        Videos in playlist:
        <br />
        <asp:ListBox ID="listBoxPlaylist" runat="server" Height="173px" Width="792px" OnSelectedIndexChanged="listBoxPlaylist_SelectedIndexChanged"></asp:ListBox>
        <!--<button type="button" onclick="loadDoc('Test.aspx', myFunction)">change</button>
        <p ng-bind="name"></p>
        First name:
        <input type="text" ng-model="firstName"><br>
        Last name:
        <input type="text" ng-model="lastName"><br>
        Full Name: {{firstName + " " + lastName}} -->

        <asp:Button ID="btnPlay" runat="server" OnClick="btnPlay_Click" Text="Play" />
        <asp:TextBox ID="textBoxTest" runat="server" type="text" ng-model="name"></asp:TextBox>
        <asp:Button ID="btnStop" runat="server" Text="Stop" />
        <br />
        <br />
        Search:<asp:TextBox ID="textBoxSearch" runat="server"></asp:TextBox>
        <asp:Button ID="btnSearch" runat="server" Text="Search" />
        <div id="search-results">
            <!-- results fill this div -->
        </div>
        <div id="buttons">
            <label>
                <input id="query" value='cats' type="text" />
                <button id="btnSearch2" disabled onclick="search()">Search</button></label>
        </div>
        <div id="search-results2">
        </div>
        <br />
        <div data-ng-controller="VideosController">
            <div>
                <form id="search" data-ng-submit="search()">
                    <input id="query" name="q" type="text" placeholder="Search for a YouTube video" data-ng-model="query">
                    <input id="submit" type="image" src="search.png" alt="Search">
                </form>
            </div>
            <div id="results">
                <div class="video" data-ng-repeat="video in results" data-ng-click="queue(video.id, video.title)">
                    <img class="video-image" data-ng-src="{{ video.thumbnail }}">
                    <p class="video-title">{{ video.title }}</p>
                    <p class="video-author">{{ video.author }}</p>
                    <p class="video-description">{{ video.description }}</p>
                </div>
            </div>
        </div>
    </form>

    <!-- 1. The <iframe> (and video player) will replace this <div> tag. -->
    <div id="player"></div>

    <script>
        var eventData = 'empty'; //player state
        // 2. This code loads the IFrame Player API code asynchronously.
        var tag = document.createElement('script');

        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        // 3. This function creates an <iframe> (and YouTube player)
        //    after the API code downloads.
        var player;
        var videoId = document.getElementById('textBoxTest').value;
        function onYouTubeIframeAPIReady() {
            player = new YT.Player('player', {
                height: '390',
                width: '640',
                videoId: videoId,
                events: {
                    'onReady': onPlayerReady,
                    'onStateChange': onPlayerReady
                }
            });
        }

        //Get play button and make player play
        document.getElementById('btnPlay').addEventListener('click', onPlayClicked);
        function onPlayClicked() {
            if (eventData == YT.PlayerState.CUED) {
                player.playVideo();
                eventData = event.data;
            }
            player.playVideo();
        }

        //Get stop button and make player stop
        document.getElementById('btnStop').addEventListener('click', onStopClicked);
        function onStopClicked() {
            if (eventData == YT.PlayerState.PLAYING) {
                player.stopVideo();
            }
        }

        // 4. The API will call this function when the video player is ready.
        function onPlayerReady(event) {
            eventData = event.data; //event.target.playVideo();
        }

        // 5. The API calls this function when the player's state changes.
        //    The function indicates that when playing a video (state=1),
        //    the player should play for six seconds and then stop.
        var done = false;
        function onPlayerStateChange(event) {
            if (event.data == YT.PlayerState.PLAYING && !done) {
                setTimeout(stopVideo, 6000);
                done = true;
            }
        }
        function stopVideo() {
            player.stopVideo();
        }

        //AJAX START
        //Base ajax function
        function loadDoc(url, cfunc) {
            var xhttp;
            xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {
                if (xhttp.readyState == 4 && xhttp.status == 200) {
                    cfunc(xhttp);
                }
            };
            xhttp.open("GET", "kunt.txt", true);
            xhttp.send();
        }

        function myFunction(xhttp) {
            document.getElementById("demo").innerHTML = xhttp.responseText;
        }

        //AngularJS start
        var app = angular.module('YouTubefy', []);

        app.service('VideosService', ['$window', '$rootScope', '$log', function ($window, $rootScope, $log) {

            var service = this;
            var results = [];

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

            this.getResults = function () {
                return results;
            };

        }]);

        app.controller('VideosController', function ($scope, $http, VideosService) {

            init();

            function init() {
                $scope.results = VideosService.getResults();
            }

            $scope.search = function () {
                $http.get('https://www.googleapis.com/youtube/v3/search', {
                    params: {
                        key: 'AIzaSyCuoHE6u2wQN5UY9JiI7z8qufPhXtU4FnY',
                        type: 'video',
                        maxResults: '8',
                        part: 'id,snippet',
                        fields: 'items/id,items/snippet/title,items/snippet/description,items/snippet/thumbnails/default,items/snippet/channelTitle',
                        q: this.query
                    }
                })
                .success(function (data) {
                    VideosService.listResults(data);
                    $log.info(data);
                })
                .error(function () {
                    $log.info('Search error');
                });
            }

            /*$http.get("https://www.googleapis.com/youtube/v3/search")
                .then(function(response) {
                    
                });
            $scope.firstName = "John";
            $scope.lastName = "Doe";*/
        });



    </script>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js"></script>
    <script src="auth.js"></script>
    <script src="angular.min.js"></script>
    <script src="search.js"></script>
    <script src="https://apis.google.com/js/client.js?onload=googleApiClientReady"></script>
</body>
</html>
