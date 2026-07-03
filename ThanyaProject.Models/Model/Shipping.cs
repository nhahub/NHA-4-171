using System.ComponentModel.DataAnnotations;

namespace CarSparePartSys.Model
{
    public class Shipping
    {
        [Key]
        public int ShippingId { get; set; }
        public int OrderId { get; set; }
        public string? Carrier { get; set; }
        public string? TrackingNumber { get; set; }
        public decimal ShippingCost { get; set; }
        public string Status { get; set; } = null!; // Pending, Shipped, InTransit, Delivered, Failed
        public DateTime? EstimatedDeliveryDate { get; set; }
        public DateTime? ShippedAt { get; set; }
        public DateTime? DeliveredAt { get; set; }


        public Order Order { get; set; } = null!;
    }
}
