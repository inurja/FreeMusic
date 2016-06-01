using System;

namespace FreeMusic
{
    public class YouTubeVideo
    {
        public string id, title, description;
        public DateTime publishedDate;

        public YouTubeVideo(string id)
        {
            this.id = id;
            YouTubeApi.GetVideoInfo(this);
        }
    }
}