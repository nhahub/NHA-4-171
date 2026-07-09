using System;
using System.ComponentModel.DataAnnotations;

namespace CarSparePartSysProject.Models.Dto.Shipping
{
    public class CreateShippingRequestDto
    {
        [Required]
        public int OrderId { get; set; }
        public string? Carrier { get; set; }
        public string? TrackingNumber { get; set; }
        public decimal ShippingCost { get; set; }
        public string Status { get; set; } = "Pending";
        public DateTime? EstimatedDeliveryDate { get; set; }
    }
}
