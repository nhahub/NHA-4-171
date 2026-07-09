using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarSparePartSysProject.Models.Dto.Cart
{
    public class CartSummaryDto
    {
        public int TotalItems { get; set; }

        public decimal TotalPrice { get; set; }
    }
}
