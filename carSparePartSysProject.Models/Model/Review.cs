using System.ComponentModel.DataAnnotations;

namespace CarSparePartSys.Model
{
    public class Review
    {
        [Key]

        public int ReviewId { get; set; }
        public int UserId { get; set; }
        public int ProductId { get; set; }
        public byte Rating { get; set; }
        public string? Comment { get; set; }
        public bool IsVerified { get; set; }
        public DateTime CreatedAt { get; set; }

        public User User { get; set; } = null!;
        public Product Product { get; set; } = null!;
    }
}
