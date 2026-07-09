using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarSparePartSysProject.Models.Dto.Orders
{
    public class OrderDetailsDto
    {
        public int OrderId { get; set; }

        public string OrderNumber { get; set; } = string.Empty;

        public DateTime OrderDate { get; set; }

        public decimal SubTotal { get; set; }

        public decimal TaxAmount { get; set; }

        public decimal DiscountAmount { get; set; }

        public decimal TotalAmount { get; set; }

        public bool IsPaid { get; set; }

        public string Status { get; set; } = string.Empty;

        public int StatusId { get; set; }

        public string StatusName { get; set; } = string.Empty;

        public string PaymentMethod { get; set; } = string.Empty;

        public CarSparePartSysProject.Models.Dto.Account.UserDto? Customer { get; set; }

        public List<OrderItemDto> OrderDetails { get; set; } = new();

        public List<OrderItemDto> Items { get; set; } = new();

        public CarSparePartSysProject.Models.Dto.Shipping.ShippingDto? Shipping { get; set; }
    }
}
