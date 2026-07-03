using CarSparePartSysProject.BL.IServices;
using CarSparePartSysProject.Models.Dto.Products;
using CarSparePartSysProject.DAL.Repositories.Interfaces;

namespace CarSparePartSysProject.BL.Service
{
    public class ProductService : IProductService
    {
        private readonly IProductRepository _productRepository;

        public ProductService(IProductRepository productRepository)
        {
            _productRepository = productRepository;
        }

        public Task<IEnumerable<ProductDto>> GetAllAsync()
        {
            throw new NotImplementedException();
        }

        public Task<ProductDto?> GetByIdAsync(int id)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<ProductDto>> GetByCategoryAsync(int categoryId)
        {
            throw new NotImplementedException();
        }

        public Task<ProductDto> CreateAsync(CreateProductRequestDto dto)
        {
            throw new NotImplementedException();
        }

        public Task<ProductDto> UpdateAsync(int id, UpdateProductRequestDto dto)
        {
            throw new NotImplementedException();
        }

        public Task DeleteAsync(int id)
        {
            throw new NotImplementedException();
        }
    }
}
