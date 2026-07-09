using System.ComponentModel.DataAnnotations;

namespace CarSparePartSys.Model
{
    public class ProductSpecification
    {
        [Key]
        public int SpecificationId { get; set; }
        public int ProductId { get; set; }
        public string SpecName { get; set; } = null!;  // e.g. "Weight", "OEM Number", "Material"
        public string SpecValue { get; set; } = null!;

        public Product Product { get; set; } = null!;
    }
}
