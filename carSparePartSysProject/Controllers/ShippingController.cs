using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CarSparePartSysProject.BL.IServices;
using CarSparePartSysProject.Models.Dto.Shipping;
using CarSparePartSysProject.DAL.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace CarSparePartSysProject.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ShippingController : ControllerBase
    {
        private readonly IShippingService _shippingService;
        private readonly AppDbContext _context;

        public ShippingController(IShippingService shippingService, AppDbContext context)
        {
            _shippingService = shippingService;
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ShippingDto>>> GetAll()
        {
            var shippingList = await _shippingService.GetAllAsync();
            return Ok(shippingList);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<ShippingDto>> GetById(int id)
        {
            var shipping = await _shippingService.GetByIdAsync(id);
            if (shipping == null)
            {
                return NotFound();
            }
            return Ok(shipping);
        }

        [HttpGet("/api/orders/{orderId:int}/shipping")]
        public async Task<ActionResult<ShippingDto>> GetByOrderId(int orderId)
        {
            var s = await _context.Shippings.FirstOrDefaultAsync(sh => sh.OrderId == orderId);
            if (s == null)
            {
                return Ok(new ShippingDto
                {
                    ShippingId = 0,
                    OrderId = orderId,
                    Carrier = "Standard Carrier",
                    TrackingNumber = "PENDING",
                    ShippingCost = 10.00m,
                    Status = "Processing",
                    EstimatedDeliveryDate = DateTime.UtcNow.AddDays(5)
                });
            }

            return Ok(new ShippingDto
            {
                ShippingId = s.ShippingId,
                OrderId = s.OrderId,
                Carrier = s.Carrier,
                TrackingNumber = s.TrackingNumber,
                ShippingCost = s.ShippingCost,
                Status = s.Status,
                EstimatedDeliveryDate = s.EstimatedDeliveryDate,
                ShippedAt = s.ShippedAt,
                DeliveredAt = s.DeliveredAt
            });
        }

        [HttpPost]
        public async Task<ActionResult<ShippingDto>> Create(CreateShippingRequestDto dto)
        {
            var shipping = await _shippingService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = shipping.ShippingId }, shipping);
        }

        [HttpPut("{id:int}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] string status)
        {
            try
            {
                await _shippingService.UpdateStatusAsync(id, status);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }
    }
}
