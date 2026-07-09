using CarSparePartSysProject.Models.Dto.Products;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarSparePartSysProject.Models.Dto.Cart
{
    public class CartItemDto
    {
        public int CartItemId { get; set; }

        public int ProductId { get; set; }

        public ProductSummaryDto Product { get; set; } = null!;

        public int Quantity { get; set; }

        public decimal UnitPrice { get; set; }

        public decimal TotalPrice { get; set; }
    }
}
