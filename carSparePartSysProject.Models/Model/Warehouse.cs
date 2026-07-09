using System.ComponentModel.DataAnnotations;

namespace CarSparePartSys.Model
{
    public class Warehouse
    {
        [Key]
        public int WarehouseId { get; set; }
        public string WarehouseName { get; set; } = null!;
        public string? Location { get; set; }
        public bool IsActive { get; set; }

        public ICollection<Inventory> Inventories { get; set; } = new List<Inventory>();
    }
}
