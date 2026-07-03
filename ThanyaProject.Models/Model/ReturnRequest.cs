using System.ComponentModel.DataAnnotations;

namespace CarSparePartSys.Model
{
    public class ReturnRequest
    {
        [Key]
        public int ReturnId { get; set; }
        public int OrderDetailId { get; set; }
        public int UserId { get; set; }
        public int Quantity { get; set; }
        public string Reason { get; set; } = null!;
        public string Status { get; set; } = null!; // Requested, Approved, Rejected, Refunded
        public decimal? RefundAmount { get; set; }
        public DateTime RequestDate { get; set; }
        public DateTime? ProcessedDate { get; set; }
        public int? ProcessedBy { get; set; }
        public string? Notes { get; set; }

        public OrderDetail OrderDetail { get; set; } = null!;
        public User User { get; set; } = null!;
        public User? Processor { get; set; }
    }
}
