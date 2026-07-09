using System.ComponentModel.DataAnnotations;

namespace CarSparePartSys.Model
{
    public class Invoice

    {
        [Key]
        public int InvoiceId { get; set; }
        public int OrderId { get; set; }
        public string InvoiceNumber { get; set; } = null!;
        public DateTime InvoiceDate { get; set; }
        public decimal TaxRate { get; set; }
        public decimal SubTotal { get; set; }
        public decimal TaxAmount { get; set; }
        public decimal TotalAmount { get; set; }
        public bool IsPaid { get; set; }
        public int GeneratedBy { get; set; }

        public Order Order { get; set; } = null!;
        public User User { get; set; } = null!;
    }
}
