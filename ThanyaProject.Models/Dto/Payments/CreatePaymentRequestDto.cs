using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarSparePartSysProject.Models.Dto.Payments
{
    public class CreatePaymentRequestDto
    {
        [Required]
        public int OrderId { get; set; }

        [Required]
        public int PaymentMethodId { get; set; }

        [Required]
        public decimal Amount { get; set; }
    }
}
