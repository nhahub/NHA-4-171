using Microsoft.AspNetCore.Mvc;
using CarSparePartSysProject.BL.IServices;
using CarSparePartSysProject.Models.Dto.Products.Inventory;
using CarSparePartSysProject.DAL.Data;
using Microsoft.EntityFrameworkCore;

namespace CarSparePartSysProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InventoryController : ControllerBase
    {
        private readonly IInventoryService _inventoryService;
        private readonly AppDbContext _context;

        public InventoryController(IInventoryService inventoryService, AppDbContext context)
        {
            _inventoryService = inventoryService;
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<InventoryDto>>> GetAll()
        {
            var inventory = await _inventoryService.GetAllAsync();
            return Ok(inventory);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<InventoryDto>> GetById(int id)
        {
            var item = await _inventoryService.GetByIdAsync(id);
            if (item == null)
            {
                return NotFound();
            }
            return Ok(item);
        }

        [HttpPut("stock")]
        public async Task<IActionResult> UpdateStock(UpdateInventoryRequestDto dto)
        {
            try
            {
                await _inventoryService.UpdateStockAsync(dto);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        [HttpGet("product/{productId:int}")]
        public async Task<ActionResult<IEnumerable<object>>> GetByProduct(int productId)
        {
            var inventory = await _context.Inventories
                .Include(i => i.Warehouse)
                .Where(i => i.ProductId == productId)
                .Select(i => new
                {
                    inventoryId = i.InventoryId,
                    productId = i.ProductId,
                    warehouseId = i.WarehouseId,
                    warehouseName = i.Warehouse != null ? i.Warehouse.WarehouseName : "Unknown Warehouse",
                    quantityInStock = i.QuantityInStock,
                    reorderLevel = i.ReorderLevel
                })
                .ToListAsync();

            return Ok(inventory);
        }
    }
}
