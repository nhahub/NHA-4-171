using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarSparePartSysProject.Models.Dto.CarBrands
{
    public class CarBrandDto
    {
        public int BrandId { get; set; }

        public string BrandName { get; set; } = string.Empty;

        public string? Country { get; set; }

        public string? LogoUrl { get; set; }
    }
}
