using System.ComponentModel.DataAnnotations;

namespace CarSparePartSys.Model
{
    public class Order
    {
        [Key]
        public int OrderId { get; set; }
        public string OrderNumber { get; set; } = null!;
        public DateTime OrderDate { get; set; }
        public decimal SubTotal { get; set; }
        public decimal TaxAmount { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal TotalAmount { get; set; }
        public bool IsPaid { get; set; }

        public int CustomerId { get; set; }
        public User Customer { get; set; } = null!;

        public int StatusId { get; set; }
        public OrderStatus Status { get; set; } = null!;

        public int? ProcessedBy { get; set; }
        public User? Processor { get; set; }

        public int ShippingAddressId { get; set; }
        public Address ShippingAddress { get; set; } = null!;

        public int? CouponId { get; set; }
        public Coupon? Coupon { get; set; }

        public Shipping? Shipping { get; set; }
        public Invoice? Invoice { get; set; }

        public string? CancelReason { get; set; }

        public ICollection<Payment> Payments { get; set; } = new List<Payment>();
        public ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();
    }
}

