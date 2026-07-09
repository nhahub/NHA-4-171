using System.ComponentModel.DataAnnotations;

namespace CarSparePartSys.Model
{
    public class Payment
    {
        [Key]

        public int PaymentId { get; set; }
        public int OrderId { get; set; }
        public decimal Amount { get; set; }
        public DateTime PaymentDate { get; set; }
        public int PaymentMethodId { get; set; }
        public string Status { get; set; } = null!; // Pending, Completed, Failed, Refunded
        public bool IsRefund { get; set; }
        public string? TransactionRef { get; set; }
        public string? Notes { get; set; }
        public string? TransactionId { get; set; }

        public string? PaymentIntentId { get; set; }
        public Order Order { get; set; } = null!;
        public PaymentMethod PaymentMethod { get; set; } = null!;
    }
}
