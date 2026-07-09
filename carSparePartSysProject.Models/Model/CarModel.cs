using System.ComponentModel.DataAnnotations;

namespace CarSparePartSys.Model
{
    public class CarModel
    {
        [Key]
        public int ModelId { get; set; }
        public int BrandId { get; set; }
        public string ModelName { get; set; } = null!;
        public short YearStart { get; set; }
        public short? YearEnd { get; set; }
        public string? EngineType { get; set; }

        public CarBrand Brand { get; set; } = null!;
        public ICollection<PartCompatibility> PartCompatibilities { get; set; } = new List<PartCompatibility>();
    }
}
