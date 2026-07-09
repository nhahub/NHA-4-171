using System;

namespace CarSparePartSysProject.Models.Dto.Shipping
{
    public class ShippingDto
    {
        public int ShippingId { get; set; }
        public int OrderId { get; set; }
        public string? Carrier { get; set; }
        public string? TrackingNumber { get; set; }
        public decimal ShippingCost { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime? EstimatedDeliveryDate { get; set; }
        public DateTime? ShippedAt { get; set; }
        public DateTime? DeliveredAt { get; set; }
    }
}
