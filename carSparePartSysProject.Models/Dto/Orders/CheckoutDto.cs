using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarSparePartSysProject.Models.Dto.Orders
{
    public class CheckoutDto
    {
        public decimal SubTotal { get; set; }

        public decimal Discount { get; set; }

        public decimal Shipping { get; set; }

        public decimal Total { get; set; }
    }
}
