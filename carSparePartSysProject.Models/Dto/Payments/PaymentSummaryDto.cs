using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarSparePartSysProject.Models.Dto.Payments
{
    public class PaymentSummaryDto
    {
        public int TotalPayments { get; set; }

        public decimal TotalAmount { get; set; }
    }
}
