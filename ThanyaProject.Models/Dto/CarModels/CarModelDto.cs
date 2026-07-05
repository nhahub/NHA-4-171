using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarSparePartSysProject.Models.Dto.CarModels
{
    public class CarModelDto
    {
        public int ModelId { get; set; }

        public int BrandId { get; set; }

        public string? BrandName { get; set; }

        public string ModelName { get; set; } = string.Empty;

        public short YearStart { get; set; }

        public short? YearEnd { get; set; }

        public string? EngineType { get; set; }
    }
}
