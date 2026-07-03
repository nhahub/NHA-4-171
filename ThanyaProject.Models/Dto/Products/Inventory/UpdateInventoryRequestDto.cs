using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarSparePartSysProject.Models.Dto.Products.Inventory
{
    public class UpdateInventoryRequestDto
    {
        [Range(0, int.MaxValue)]
        public int? QuantityInStock { get; set; }

        [Range(0, int.MaxValue)]
        public int? ReorderLevel { get; set; }
    }
}
