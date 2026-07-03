using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarSparePartSysProject.Models.Dto.Products.Inventory
{
    public class InventoryDto
    {
        public int InventoryId { get; set; }

        public int ProductId { get; set; }

        public string? ProductName { get; set; }

        public int QuantityInStock { get; set; }

        public int ReorderLevel { get; set; }

        public DateTime? LastRestocked { get; set; }
    }
}
