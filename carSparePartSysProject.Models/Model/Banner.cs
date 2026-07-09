using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarSparePartSysProject.Models.Model
{
    public class Banner
    {
        public int BannerId { get; set; }

        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        public string ImageUrl { get; set; } = string.Empty;

        public string? RedirectUrl { get; set; }

        public bool IsActive { get; set; } = true;

        public int DisplayOrder { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
