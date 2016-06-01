using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Services;
using Google.Apis.Util.Store;
using Google.Apis.YouTube.v3;
using System.IO;
using System.Threading;

namespace FreeMusic
{
    public class YouTubeApi
    {
        private static YouTubeService ytService = Auth();

        private static YouTubeService Auth()
        {
            UserCredential creds;
            using (var stream = new FileStream(HttpRuntime.AppDomainAppPath + "yt_client_secret.json", FileMode.Open, FileAccess.Read))
            {
                creds = GoogleWebAuthorizationBroker.AuthorizeAsync(
                    GoogleClientSecrets.Load(stream).Secrets,
                    new[] {YouTubeService.Scope.YoutubeReadonly},
                    "user",
                    CancellationToken.None,
                    new FileDataStore("YouTubeAPI")
                    ).Result;
            }

            var service = new YouTubeService(new BaseClientService.Initializer()
            {
                HttpClientInitializer = creds,
                ApplicationName = "YouTubeAPI"
            });

            return service;
        }

        public static void GetVideoInfo(YouTubeVideo video)
        {
            var videoRequest = ytService.Videos.List("snippet"); //snippet tells the API to retrive info like titles, descriptions, thumbnails, channelId's, publish times, channel names
            videoRequest.Id = video.id;

            var response = videoRequest.Execute();
            if (response.Items.Count > 0)
            {
                video.title = response.Items[0].Snippet.Title;
                video.description = response.Items[0].Snippet.Description;
                video.publishedDate = response.Items[0].Snippet.PublishedAt.Value;
            }
            else
            {
                //do something when Video ID not found
            }
            
        }

        public static YouTubeVideo[] GetPlaylist(string playlistId)
        {
            var request = ytService.PlaylistItems.List("contentDetails");
            request.PlaylistId = playlistId;

            

            //Use LinkedList because we are dynamically adding new videos to the list in the while loop
            LinkedList<YouTubeVideo> videos = new LinkedList<YouTubeVideo>();
            string nextPage = "";

            while (nextPage != null)
            {
                request.PageToken = nextPage;
                var response = request.Execute();

                int i = 0;
                foreach (var item in response.Items)
                {
                    videos.AddLast(new YouTubeVideo(item.ContentDetails.VideoId));
                }

                nextPage = response.NextPageToken;
            }
            
            return videos.ToArray<YouTubeVideo>();
        }
    }
}