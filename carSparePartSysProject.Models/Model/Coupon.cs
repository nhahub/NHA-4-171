using System.ComponentModel.DataAnnotations;

namespace CarSparePartSys.Model
{
    public enum DiscountType
    {
        Percentage,
        FixedAmount
    }

    public class Coupon
    {
        [Key]
        public int CouponId { get; set; }
        public string Code { get; set; } = null!;
        public string? Description { get; set; }
        public DiscountType DiscountType { get; set; }
        public decimal DiscountValue { get; set; }
        public decimal? MinOrderAmount { get; set; }
        public decimal? MaxDiscountAmount { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int? UsageLimit { get; set; }
        public int UsedCount { get; set; }
        public bool IsActive { get; set; }

        public ICollection<Order> Orders { get; set; } = new List<Order>();
    }
}
