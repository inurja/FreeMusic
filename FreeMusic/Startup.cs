using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(FreeMusic.Startup))]
namespace FreeMusic
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
