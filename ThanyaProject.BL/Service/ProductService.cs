using CarSparePartSysProject.BL.IServices;
using CarSparePartSysProject.Models.Dto.Products;
using CarSparePartSysProject.DAL.Repositories.Interfaces;
using CarSparePartSys.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CarSparePartSysProject.BL.Service
{
    public class ProductService : IProductService
    {
        private readonly IProductRepository _productRepository;
        private readonly ICategoryRepository _categoryRepository;
        private readonly ISupplierRepository _supplierRepository;

        public ProductService(
            IProductRepository productRepository,
            ICategoryRepository categoryRepository,
            ISupplierRepository supplierRepository)
        {
            _productRepository = productRepository;
            _categoryRepository = categoryRepository;
            _supplierRepository = supplierRepository;
        }

        private async Task<ProductDto> MapToDtoAsync(Product p)
        {
            var category = await _categoryRepository.GetByIdAsync(p.CategoryId);
            var supplier = p.SupplierId.HasValue ? await _supplierRepository.GetByIdAsync(p.SupplierId.Value) : null;

            return new ProductDto
            {
                ProductId = p.ProductId,
                ProductName = p.ProductName,
                Description = p.Description,
                UnitPrice = p.UnitPrice,
                ImageUrl = p.ImageUrl,
                IsActive = p.IsActive,
                CategoryId = p.CategoryId,
                CategoryName = category?.CategoryName,
                SupplierId = p.SupplierId ?? 0,
                SupplierName = supplier?.SupplierName,
                Inventories = p.Inventories?.Select(i => new CarSparePartSysProject.Models.Dto.Products.Inventory.InventoryDto
                {
                    InventoryId = i.InventoryId,
                    ProductId = i.ProductId,
                    QuantityInStock = i.QuantityInStock,
                    ReorderLevel = i.ReorderLevel,
                    LastRestocked = i.LastUpdated
                }).ToList() ?? new()
            };
        }

        public async Task<IEnumerable<ProductDto>> GetAllAsync()
        {
            var products = await _productRepository.GetAllAsync();
            var list = new List<ProductDto>();
            foreach (var p in products)
            {
                list.Add(await MapToDtoAsync(p));
            }
            return list;
        }

        public async Task<ProductDto?> GetByIdAsync(int id)
        {
            var p = await _productRepository.GetByIdAsync(id);
            if (p == null) return null;
            return await MapToDtoAsync(p);
        }

        public async Task<IEnumerable<ProductDto>> GetByCategoryAsync(int categoryId)
        {
            var products = await _productRepository.GetProductsByCategoryAsync(categoryId);
            var list = new List<ProductDto>();
            foreach (var p in products)
            {
                list.Add(await MapToDtoAsync(p));
            }
            return list;
        }

        public async Task<ProductDto> CreateAsync(CreateProductRequestDto dto)
        {
            var p = new Product
            {
                ProductName = dto.ProductName,
                Description = dto.Description,
                UnitPrice = dto.UnitPrice,
                ImageUrl = dto.ImageUrl,
                CategoryId = dto.CategoryId,
                SupplierId = dto.SupplierId,
                IsActive = dto.IsActive,
                SKU = "SKU-" + Guid.NewGuid().ToString().Substring(0, 8).ToUpper(),
                CreatedAt = DateTime.UtcNow
            };

            await _productRepository.AddAsync(p);
            await _productRepository.SaveAsync();

            return await MapToDtoAsync(p);
        }

        public async Task<ProductDto> UpdateAsync(int id, UpdateProductRequestDto dto)
        {
            var p = await _productRepository.GetByIdAsync(id);
            if (p == null)
            {
                throw new KeyNotFoundException("Product not found.");
            }

            p.ProductName = dto.ProductName ?? p.ProductName;
            p.Description = dto.Description ?? p.Description;
            p.UnitPrice = dto.UnitPrice ?? p.UnitPrice;
            p.ImageUrl = dto.ImageUrl ?? p.ImageUrl;
            p.CategoryId = dto.CategoryId ?? p.CategoryId;
            p.SupplierId = dto.SupplierId ?? p.SupplierId;
            p.IsActive = dto.IsActive ?? p.IsActive;

            _productRepository.Update(p);
            await _productRepository.SaveAsync();

            return await MapToDtoAsync(p);
        }

        public async Task DeleteAsync(int id)
        {
            var p = await _productRepository.GetByIdAsync(id);
            if (p != null)
            {
                _productRepository.Delete(p);
                await _productRepository.SaveAsync();
            }
        }
    }
}
