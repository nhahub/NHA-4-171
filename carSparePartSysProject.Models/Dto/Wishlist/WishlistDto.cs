using CarSparePartSysProject.Models.Dto.Products;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarSparePartSysProject.Models.Dto.Wishlist
{
    public class WishlistDto
    {
        public int WishlistId { get; set; }

        public ProductSummaryDto Product { get; set; } = null!;

        public DateTime AddedAt { get; set; }
    }
}
