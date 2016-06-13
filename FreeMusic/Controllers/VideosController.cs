using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Mvc;

namespace FreeMusic.Controllers
{
    public class VideosController : Controller
    {

        // GET: Videos
        public ActionResult Index()
        {
            //return View(db.Videos.ToList());
            return View();
        }
    }
}