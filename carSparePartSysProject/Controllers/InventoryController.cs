using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using CarSparePartSysProject.BL.IServices;
using CarSparePartSysProject.Models.Dto.Products.Inventory;
using CarSparePartSysProject.DAL.Data;
using Microsoft.EntityFrameworkCore;
using CarSparePartSys.Model;

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

        [Authorize(Roles = "Admin")]
        [HttpGet("transactions")]
        public async Task<ActionResult<IEnumerable<StockTransactionDto>>> GetTransactions()
        {
            var transactions = await _context.StockTransactions
                .Include(t => t.Product)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();

            var warehouses = await _context.Warehouses.ToListAsync();

            return Ok(transactions.Select(t => {
                var wh = warehouses.FirstOrDefault(w => w.WarehouseId == t.ReferenceId);
                return new StockTransactionDto
                {
                    TransactionId = t.TransactionId,
                    ProductId = t.ProductId,
                    ProductName = t.Product?.ProductName ?? "Product #" + t.ProductId,
                    WarehouseId = t.ReferenceId,
                    WarehouseName = wh?.WarehouseName ?? "Unknown Warehouse",
                    Quantity = t.Quantity,
                    TransactionType = t.TransactionType,
                    Date = t.CreatedAt
                };
            }));
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("adjust")]
        public async Task<IActionResult> AdjustStock([FromBody] AdjustStockRequestDto dto)
        {
            var inventory = await _context.Inventories
                .FirstOrDefaultAsync(i => i.ProductId == dto.ProductId && i.WarehouseId == dto.WarehouseId);

            if (inventory == null)
            {
                // Create a new inventory record if it doesn't exist
                inventory = new Inventory
                {
                    ProductId = dto.ProductId,
                    WarehouseId = dto.WarehouseId,
                    QuantityInStock = 0,
                    ReorderLevel = 10,
                    LastUpdated = DateTime.UtcNow
                };
                await _context.Inventories.AddAsync(inventory);
            }

            inventory.QuantityInStock = Math.Max(0, inventory.QuantityInStock + dto.Quantity);
            inventory.LastUpdated = DateTime.UtcNow;

            // Log stock transaction
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int adminId = 1; // default to first seeded admin if not parsed
            if (userIdClaim != null && int.TryParse(userIdClaim, out int parsedId))
            {
                adminId = parsedId;
            }

            var transaction = new StockTransaction
            {
                ProductId = dto.ProductId,
                TransactionType = dto.TransactionType,
                Quantity = dto.Quantity,
                ReferenceId = dto.WarehouseId, // Use ReferenceId to store WarehouseId
                Notes = $"Manual stock adjustment of {dto.Quantity} units.",
                CreatedBy = adminId,
                CreatedAt = DateTime.UtcNow
            };

            await _context.StockTransactions.AddAsync(transaction);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
