using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarSparePartSysProject.Models.Dto.Compatibility
{
    public class CompatibilityDto
    {
        public int CompatibilityId { get; set; }

        public int ProductId { get; set; }

        public string? ProductName { get; set; }

        public int ModelId { get; set; }

        public string? ModelName { get; set; }

        public string? Notes { get; set; }
    }
}
