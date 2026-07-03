using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarSparePartSysProject.Models.Dto.Orders
{
    public class CreateOrderRequestDto
    {
        [Required]
        public int AddressId { get; set; }

        [Required]
        public int PaymentMethodId { get; set; }

        public string? CouponCode { get; set; }
    }
}
