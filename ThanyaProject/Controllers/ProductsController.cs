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
                query = query.Where(p => p.ProductName.ToLower().Contains(s) || (p.Description != null && p.Description.ToLower().Contains(s)));
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
                CategoryId = p.CategoryId,
                CategoryName = p.Category?.CategoryName,
                SupplierId = p.SupplierId ?? 0,
                SupplierName = p.Supplier?.SupplierName
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
                .Where(p => p.ProductName.ToLower().Contains(s) || (p.Description != null && p.Description.ToLower().Contains(s)))
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
                CategoryId = p.CategoryId,
                CategoryName = p.Category?.CategoryName,
                SupplierId = p.SupplierId ?? 0,
                SupplierName = p.Supplier?.SupplierName
            }));
        }

        [HttpGet("featured")]
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetFeatured()
        {
            var products = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Supplier)
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
                CategoryId = p.CategoryId,
                CategoryName = p.Category?.CategoryName,
                SupplierId = p.SupplierId ?? 0,
                SupplierName = p.Supplier?.SupplierName
            }));
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<ProductDto>> GetById(int id)
        {
            var product = await _productService.GetByIdAsync(id);
            if (product == null)
            {
                return NotFound();
            }
            return Ok(product);
        }

        [HttpGet("category/{categoryId:int}")]
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetByCategory(int categoryId)
        {
            var products = await _productService.GetByCategoryAsync(categoryId);
            return Ok(products);
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
