using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarSparePartSysProject.Models.Dto.CarBrands
{
    public class UpdateCarBrandRequestDto
    {
        [MaxLength(100)]
        public string? BrandName { get; set; }

        [MaxLength(100)]
        public string? Country { get; set; }

        public string? LogoUrl { get; set; }
    }
}
