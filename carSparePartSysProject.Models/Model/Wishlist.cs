using System.ComponentModel.DataAnnotations;

namespace CarSparePartSys.Model
{
    public class Wishlist
    {
        [Key]
        public int WishlistId { get; set; }
        public int UserId { get; set; }
        public int ProductId { get; set; }
        public DateTime AddedAt { get; set; }

        public User User { get; set; } = null!;
        public Product Product { get; set; } = null!;
    }
}
