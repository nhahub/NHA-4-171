using CarSparePartSysProject.Models.Dto.Products;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CarSparePartSysProject.BL.IServices
{
    public interface IProductService
    {
        Task<IEnumerable<ProductDto>> GetAllAsync();
        Task<ProductDto?> GetByIdAsync(int id);
        Task<IEnumerable<ProductDto>> GetByCategoryAsync(int categoryId);
        Task<ProductDto> CreateAsync(CreateProductRequestDto dto);
        Task<ProductDto> UpdateAsync(int id, UpdateProductRequestDto dto);
        Task DeleteAsync(int id);
    }
}
