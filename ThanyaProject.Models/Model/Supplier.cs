using System.ComponentModel.DataAnnotations;

namespace CarSparePartSys.Model
{
    public class Supplier

    {
        [Key]

        public int SupplierId { get; set; }
        public string SupplierName { get; set; } = null!;
        public string? ContactPerson { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public string? TaxNumber { get; set; }
        public bool IsActive { get; set; }

        public ICollection<Product> Products { get; set; } = new List<Product>();
    }
}
