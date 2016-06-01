using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Migrations;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain;

namespace DAL
{
    public class DataBaseContext : DbContext
    {
        public DataBaseContext() : base("DbConnectionString")
        {
            Database.SetInitializer(new DropCreateDatabaseAlways<DataBaseContext>());
        }

        public DbSet<Video> Videos { get; set; }
    }
}
