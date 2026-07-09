namespace CarSparePartSys.Model
{
    public class Inventory
    {
        public int InventoryId { get; set; }
        public int ProductId { get; set; }
        public int WarehouseId { get; set; }
        public int QuantityInStock { get; set; }
        public int ReorderLevel { get; set; }
        public int? MaxStockLevel { get; set; }
        public DateTime LastUpdated { get; set; }

        public Product Product { get; set; } = null!;
        public Warehouse Warehouse { get; set; } = null!;
    }
}
