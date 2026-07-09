using System.ComponentModel.DataAnnotations;

namespace CarSparePartSys.Model
{
    public class PartCompatibility
    {
        [Key]

        public int CompatibilityId { get; set; }
        public int ProductId { get; set; }
        public int ModelId { get; set; }
        public string? Notes { get; set; }

        public Product Product { get; set; } = null!;
        public CarModel CarModel { get; set; } = null!;
    }
}
