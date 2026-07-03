using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarSparePartSysProject.Models.Dto.Products
{
    public class ProductDetailsDto : ProductDto
    {
        public int TotalStock { get; set; }

        public double AverageRating { get; set; }

        public int ReviewsCount { get; set; }
    }
}
