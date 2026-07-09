using System.ComponentModel.DataAnnotations;

namespace CarSparePartSys.Model
{
    public class OrderStatus
    {
        [Key]

        public int StatusId { get; set; }
        public string StatusName { get; set; } = null!;

        public ICollection<Order> Orders { get; set; } = new List<Order>();
    }
}
