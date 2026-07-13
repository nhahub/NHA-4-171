using Microsoft.AspNetCore.Mvc;
using CarSparePartSysProject.BL.IServices;
using CarSparePartSysProject.Models.Dto.Products;
using CarSparePartSysProject.DAL.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CarSparePartSysProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly IProductService _productService;
        private readonly AppDbContext _context;

        public ProductsController(IProductService productService, AppDbContext context)
        {
            _productService = productService;
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<object>> GetAll(
            [FromQuery] int? categoryId,
            [FromQuery] int? brandId,
            [FromQuery] int? modelId,
            [FromQuery] int? supplierId,
            [FromQuery] decimal? minPrice,
            [FromQuery] decimal? maxPrice,
            [FromQuery] string? sort = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 12,
            [FromQuery] string? search = null)
        {
            var query = _context.Products
                .Include(p => p.Category)
                .Include(p => p.Supplier)
                .Include(p => p.PartCompatibilities)
                .Include(p => p.Inventories)
                .Include(p => p.Reviews)
                .AsNoTracking();

            // Filters
            if (categoryId.HasValue)
            {
                query = query.Where(p => p.CategoryId == categoryId.Value || p.Category.ParentCategoryId == categoryId.Value);
            }

            if (brandId.HasValue)
            {
                query = query.Where(p => p.PartCompatibilities.Any(pc => pc.CarModel.BrandId == brandId.Value));
            }

            if (modelId.HasValue)
            {
                query = query.Where(p => p.PartCompatibilities.Any(pc => pc.ModelId == modelId.Value));
            }

            if (supplierId.HasValue)
            {
                query = query.Where(p => p.SupplierId == supplierId.Value);
            }

            if (minPrice.HasValue)
            {
                query = query.Where(p => p.UnitPrice >= minPrice.Value);
            }

            if (maxPrice.HasValue)
            {
                query = query.Where(p => p.UnitPrice <= maxPrice.Value);
            }

            if (!string.IsNullOrEmpty(search))
            {
                var s = search.ToLower();
                query = query.Where(p => 
                    p.ProductName.ToLower().Contains(s) || 
                    (p.Description != null && p.Description.ToLower().Contains(s)) ||
                    p.SKU.ToLower().Contains(s) ||
                    (p.PartNumber != null && p.PartNumber.ToLower().Contains(s)) ||
                    p.Category.CategoryName.ToLower().Contains(s) ||
                    (p.Supplier != null && p.Supplier.SupplierName.ToLower().Contains(s))
                );
            }

            // Sorting
            if (sort == "price-low")
            {
                query = query.OrderBy(p => p.UnitPrice);
            }
            else if (sort == "price-high")
            {
                query = query.OrderByDescending(p => p.UnitPrice);
            }
            else if (sort == "name-asc")
            {
                query = query.OrderBy(p => p.ProductName);
            }
            else if (sort == "name-desc")
            {
                query = query.OrderByDescending(p => p.ProductName);
            }
            else // default or newest
            {
                query = query.OrderByDescending(p => p.CreatedAt);
            }

            // Count & Page
            int totalCount = await query.CountAsync();
            var products = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var items = products.Select(p => new ProductDto
            {
                ProductId = p.ProductId,
                ProductName = p.ProductName,
                Description = p.Description,
                UnitPrice = p.UnitPrice,
                ImageUrl = p.ImageUrl,
                IsActive = p.IsActive,
                SKU = p.SKU,
                PartNumber = p.PartNumber,
                CategoryId = p.CategoryId,
                CategoryName = p.Category?.CategoryName,
                SupplierId = p.SupplierId ?? 0,
                SupplierName = p.Supplier?.SupplierName,
                Inventories = p.Inventories.Select(i => new CarSparePartSysProject.Models.Dto.Products.Inventory.InventoryDto
                {
                    InventoryId = i.InventoryId,
                    ProductId = i.ProductId,
                    QuantityInStock = i.QuantityInStock,
                    ReorderLevel = i.ReorderLevel,
                    LastRestocked = i.LastUpdated
                }).ToList(),
                AverageRating = p.Reviews.Any(r => r.IsVerified) ? Math.Round(p.Reviews.Where(r => r.IsVerified).Average(r => (double)r.Rating), 1) : 0.0,
                ReviewsCount = p.Reviews.Count(r => r.IsVerified)
            }).ToList();

            int totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

            return Ok(new
            {
                items,
                totalCount,
                totalPages
            });
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<ProductDto>>> Search([FromQuery] string q)
        {
            if (string.IsNullOrEmpty(q)) return Ok(new List<ProductDto>());
            var s = q.ToLower();
            var products = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Supplier)
                .Include(p => p.Inventories)
                .Include(p => p.Reviews)
                .Where(p => 
                    p.ProductName.ToLower().Contains(s) || 
                    (p.Description != null && p.Description.ToLower().Contains(s)) ||
                    p.SKU.ToLower().Contains(s) ||
                    (p.PartNumber != null && p.PartNumber.ToLower().Contains(s)) ||
                    p.Category.CategoryName.ToLower().Contains(s) ||
                    (p.Supplier != null && p.Supplier.SupplierName.ToLower().Contains(s))
                )
                .Take(20)
                .ToListAsync();

            return Ok(products.Select(p => new ProductDto
            {
                ProductId = p.ProductId,
                ProductName = p.ProductName,
                Description = p.Description,
                UnitPrice = p.UnitPrice,
                ImageUrl = p.ImageUrl,
                IsActive = p.IsActive,
                SKU = p.SKU,
                PartNumber = p.PartNumber,
                CategoryId = p.CategoryId,
                CategoryName = p.Category?.CategoryName,
                SupplierId = p.SupplierId ?? 0,
                SupplierName = p.Supplier?.SupplierName,
                Inventories = p.Inventories.Select(i => new CarSparePartSysProject.Models.Dto.Products.Inventory.InventoryDto
                {
                    InventoryId = i.InventoryId,
                    ProductId = i.ProductId,
                    QuantityInStock = i.QuantityInStock,
                    ReorderLevel = i.ReorderLevel,
                    LastRestocked = i.LastUpdated
                }).ToList(),
                AverageRating = p.Reviews.Any(r => r.IsVerified) ? Math.Round(p.Reviews.Where(r => r.IsVerified).Average(r => (double)r.Rating), 1) : 0.0,
                ReviewsCount = p.Reviews.Count(r => r.IsVerified)
            }));
        }

        [HttpGet("featured")]
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetFeatured()
        {
            var products = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Supplier)
                .Include(p => p.Inventories)
                .Include(p => p.Reviews)
                .Where(p => p.IsActive)
                .Take(8)
                .ToListAsync();

            return Ok(products.Select(p => new ProductDto
            {
                ProductId = p.ProductId,
                ProductName = p.ProductName,
                Description = p.Description,
                UnitPrice = p.UnitPrice,
                ImageUrl = p.ImageUrl,
                IsActive = p.IsActive,
                SKU = p.SKU,
                PartNumber = p.PartNumber,
                CategoryId = p.CategoryId,
                CategoryName = p.Category?.CategoryName,
                SupplierId = p.SupplierId ?? 0,
                SupplierName = p.Supplier?.SupplierName,
                Inventories = p.Inventories.Select(i => new CarSparePartSysProject.Models.Dto.Products.Inventory.InventoryDto
                {
                    InventoryId = i.InventoryId,
                    ProductId = i.ProductId,
                    QuantityInStock = i.QuantityInStock,
                    ReorderLevel = i.ReorderLevel,
                    LastRestocked = i.LastUpdated
                }).ToList(),
                AverageRating = p.Reviews.Any(r => r.IsVerified) ? Math.Round(p.Reviews.Where(r => r.IsVerified).Average(r => (double)r.Rating), 1) : 0.0,
                ReviewsCount = p.Reviews.Count(r => r.IsVerified)
            }));
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<ProductDto>> GetById(int id)
        {
            var product = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Supplier)
                .Include(p => p.Inventories)
                .Include(p => p.Reviews)
                .FirstOrDefaultAsync(p => p.ProductId == id);

            if (product == null)
            {
                return NotFound();
            }

            var dto = new ProductDto
            {
                ProductId = product.ProductId,
                ProductName = product.ProductName,
                Description = product.Description,
                UnitPrice = product.UnitPrice,
                ImageUrl = product.ImageUrl,
                IsActive = product.IsActive,
                SKU = product.SKU,
                PartNumber = product.PartNumber,
                CategoryId = product.CategoryId,
                CategoryName = product.Category?.CategoryName,
                SupplierId = product.SupplierId ?? 0,
                SupplierName = product.Supplier?.SupplierName,
                Inventories = product.Inventories.Select(i => new CarSparePartSysProject.Models.Dto.Products.Inventory.InventoryDto
                {
                    InventoryId = i.InventoryId,
                    ProductId = i.ProductId,
                    QuantityInStock = i.QuantityInStock,
                    ReorderLevel = i.ReorderLevel,
                    LastRestocked = i.LastUpdated
                }).ToList(),
                AverageRating = product.Reviews.Any(r => r.IsVerified) ? Math.Round(product.Reviews.Where(r => r.IsVerified).Average(r => (double)r.Rating), 1) : 0.0,
                ReviewsCount = product.Reviews.Count(r => r.IsVerified)
            };

            return Ok(dto);
        }

        [HttpGet("category/{categoryId:int}")]
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetByCategory(int categoryId)
        {
            var products = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Supplier)
                .Include(p => p.Inventories)
                .Include(p => p.Reviews)
                .Where(p => p.CategoryId == categoryId)
                .ToListAsync();

            return Ok(products.Select(p => new ProductDto
            {
                ProductId = p.ProductId,
                ProductName = p.ProductName,
                Description = p.Description,
                UnitPrice = p.UnitPrice,
                ImageUrl = p.ImageUrl,
                IsActive = p.IsActive,
                SKU = p.SKU,
                PartNumber = p.PartNumber,
                CategoryId = p.CategoryId,
                CategoryName = p.Category?.CategoryName,
                SupplierId = p.SupplierId ?? 0,
                SupplierName = p.Supplier?.SupplierName,
                Inventories = p.Inventories.Select(i => new CarSparePartSysProject.Models.Dto.Products.Inventory.InventoryDto
                {
                    InventoryId = i.InventoryId,
                    ProductId = i.ProductId,
                    QuantityInStock = i.QuantityInStock,
                    ReorderLevel = i.ReorderLevel,
                    LastRestocked = i.LastUpdated
                }).ToList(),
                AverageRating = p.Reviews.Any(r => r.IsVerified) ? Math.Round(p.Reviews.Where(r => r.IsVerified).Average(r => (double)r.Rating), 1) : 0.0,
                ReviewsCount = p.Reviews.Count(r => r.IsVerified)
            }));
        }

        [HttpPost]
        public async Task<ActionResult<ProductDto>> Create(CreateProductRequestDto dto)
        {
            var product = await _productService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = product.ProductId }, product);
        }

        [HttpPut("{id:int}")]
        public async Task<ActionResult<ProductDto>> Update(int id, UpdateProductRequestDto dto)
        {
            try
            {
                var product = await _productService.UpdateAsync(id, dto);
                return Ok(product);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _productService.DeleteAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }
    }
}
