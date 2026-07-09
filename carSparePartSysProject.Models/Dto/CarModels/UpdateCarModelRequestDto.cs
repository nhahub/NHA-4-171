using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarSparePartSysProject.Models.Dto.CarModels
{
    public class UpdateCarModelRequestDto
    {
        public int? BrandId { get; set; }

        [MaxLength(100)]
        public string? ModelName { get; set; }

        public short? YearStart { get; set; }

        public short? YearEnd { get; set; }

        [MaxLength(50)]
        public string? EngineType { get; set; }
    }
}
