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
    }
}
