using System.ComponentModel.DataAnnotations;

namespace CarSparePartSys.Model
{
    public class StockTransaction
    {
        [Key]

        public int TransactionId { get; set; }
        public int ProductId { get; set; }
        public string TransactionType { get; set; } = null!;
        public int Quantity { get; set; }
        public int? ReferenceId { get; set; }
        public string? Notes { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; }

        public Product Product { get; set; } = null!;
        public User User { get; set; } = null!;
    }
}
