using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarSparePartSysProject.Models.Dto.Products
{
    public class ProductSummaryDto
    {
        public int ProductId { get; set; }

        public string ProductName { get; set; } = string.Empty;

        public decimal UnitPrice { get; set; }

        public string? ImageUrl { get; set; }

        public double AverageRating { get; set; }

        public int ReviewsCount { get; set; }
    }
}
