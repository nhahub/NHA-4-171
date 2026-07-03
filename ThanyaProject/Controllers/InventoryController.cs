using Microsoft.AspNetCore.Mvc;
using CarSparePartSysProject.BL.IServices;
using CarSparePartSysProject.Models.Dto.Products.Inventory;

namespace CarSparePartSysProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InventoryController : ControllerBase
    {
        private readonly IInventoryService _inventoryService;

        public InventoryController(IInventoryService inventoryService)
        {
            _inventoryService = inventoryService;
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
    }
}
