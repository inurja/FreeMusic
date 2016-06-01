using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain
{
    public class Video
    {
        [Key]
        public int YoutubeId { get; set; }
        
        public string Title { get; set; }
        [Required]
        public string VideoId { get; set; }


    }
}
