using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarSparePartSysProject.Models.Dto.Cart
{
    public class CartDto
    {public int CartId { get; set; }

        public decimal TotalPrice { get; set; }

        public int TotalItems { get; set; }

        public List<CartItemDto> Items { get; set; } = new();
    }
}
