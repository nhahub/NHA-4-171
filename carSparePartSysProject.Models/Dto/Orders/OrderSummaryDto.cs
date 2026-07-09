using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarSparePartSysProject.Models.Dto.Orders
{
    public class OrderSummaryDto
    {
        public int TotalOrders { get; set; }

        public decimal TotalSpent { get; set; }
    }
}
