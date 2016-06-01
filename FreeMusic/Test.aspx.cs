using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace FreeMusic
{
    public partial class Test : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {

        }

        protected void btnGetDataByID_Click(object sender, EventArgs e)
        {
            string videoId = textBoxVideoID.Text;
            YouTubeVideo video = new YouTubeVideo(videoId);
            labelTitle.Text = video.title;
            labelPublishDate.Text = video.publishedDate.ToShortDateString();
        }

        protected void btnGetPlaylist_Click(object sender, EventArgs e)
        {
            string playlistId = textBoxPlaylistID.Text;
            YouTubeVideo[] videos = YouTubeApi.GetPlaylist(playlistId);

            foreach (var video in videos)
            {
                listBoxPlaylist.Items.Add(video.id); //video.publishedDate.ToShortDateString() + ": " +  video.title + " (" + video.id + " )"
            }
        }

        protected void btnPlay_Click(object sender, EventArgs e)
        {
            string videoId = listBoxPlaylist.SelectedItem.ToString(); //SelectedItem.ToString();
            textBoxTest.Text = videoId;
        }

        protected void listBoxPlaylist_SelectedIndexChanged(object sender, EventArgs e)
        {
            string videoId = listBoxPlaylist.SelectedItem.ToString();
            textBoxTest.Text = videoId;
        }
    }
}