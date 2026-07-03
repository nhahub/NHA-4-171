using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarSparePartSysProject.Models.Dto.Wishlist
{
    public class AddToWishlistRequestDto
    {
        [Required]
        public int ProductId { get; set; }
    }
}
