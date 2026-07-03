using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarSparePartSysProject.Models.Dto.Products
{
    public class ProductDto
    {
        public int ProductId { get; set; }

        public string ProductName { get; set; } = string.Empty;

        public string? Description { get; set; }

        public decimal UnitPrice { get; set; }

        public string? ImageUrl { get; set; }

        public bool IsActive { get; set; }

        public int CategoryId { get; set; }

        public string? CategoryName { get; set; }

        public int SupplierId { get; set; }

        public string? SupplierName { get; set; }
    }
}
