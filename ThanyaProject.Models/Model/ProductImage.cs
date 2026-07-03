using System.ComponentModel.DataAnnotations;

namespace CarSparePartSys.Model
{
    public class ProductImage
    {
        [Key]
        public int ProductImageId { get; set; }
        public int ProductId { get; set; }
        public string ImageUrl { get; set; } = null!;
        public bool IsPrimary { get; set; }
        public int DisplayOrder { get; set; }

        public Product Product { get; set; } = null!;
    }
}
