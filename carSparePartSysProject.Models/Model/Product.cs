using System.ComponentModel.DataAnnotations;

namespace CarSparePartSys.Model
{
    public class Product
    {
        [Key]

        public int ProductId { get; set; }
        public string ProductName { get; set; } = null!;
        public string SKU { get; set; } = null!;
        public string? PartNumber { get; set; }
        public string? Description { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal? CostPrice { get; set; }
        public string? ImageUrl { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }

        public int CategoryId { get; set; }
        public Category Category { get; set; } = null!;

        public int? SupplierId { get; set; }
        public Supplier? Supplier { get; set; }

        public ICollection<Inventory> Inventories { get; set; } = new List<Inventory>();

        public ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();
        public ICollection<Review> Reviews { get; set; } = new List<Review>();
        public ICollection<PartCompatibility> PartCompatibilities { get; set; } = new List<PartCompatibility>();
        public ICollection<StockTransaction> StockTransactions { get; set; } = new List<StockTransaction>();
        public ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();
        public ICollection<ProductSpecification> Specifications { get; set; } = new List<ProductSpecification>();
        public ICollection<Wishlist> WishlistedBy { get; set; } = new List<Wishlist>();
    }
}
