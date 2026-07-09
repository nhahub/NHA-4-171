using System.ComponentModel.DataAnnotations;

namespace CarSparePartSysProject.Models.Dto.Products.Inventory
{
    public class AdjustStockRequestDto
    {
        [Required]
        public int ProductId { get; set; }

        [Required]
        public int WarehouseId { get; set; }

        [Required]
        public int Quantity { get; set; }

        [Required]
        public string TransactionType { get; set; } = "Adjustment";
    }
}
