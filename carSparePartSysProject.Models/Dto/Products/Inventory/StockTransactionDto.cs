using System;

namespace CarSparePartSysProject.Models.Dto.Products.Inventory
{
    public class StockTransactionDto
    {
        public int TransactionId { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public int? WarehouseId { get; set; }
        public string WarehouseName { get; set; } = "Unknown Warehouse";
        public int Quantity { get; set; }
        public string TransactionType { get; set; } = string.Empty;
        public DateTime Date { get; set; }
    }
}
