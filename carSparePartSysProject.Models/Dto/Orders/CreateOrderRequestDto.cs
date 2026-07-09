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

        public int ShippingAddressId { get => AddressId; set => AddressId = value; }

        [Required]
        public int PaymentMethodId { get; set; }

        public string? CouponCode { get; set; }
    }
}
