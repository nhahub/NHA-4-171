using System.ComponentModel.DataAnnotations;

namespace CarSparePartSys.Model
{
    public class CarBrand

    {

        [Key]
        public int BrandId { get; set; }
        public string BrandName { get; set; } = null!;
        public string? Country { get; set; }
        public string? LogoUrl { get; set; }

        public ICollection<CarModel> Models { get; set; } = new List<CarModel>();
    }
}
