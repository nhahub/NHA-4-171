using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CarSparePartSysProject.BL.IServices;
using CarSparePartSysProject.Models.Dto.Orders;
using System.Security.Claims;
using CarSparePartSysProject.DAL.Data;
using CarSparePartSys.Model;

namespace CarSparePartSysProject.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderService _orderService;
        private readonly AppDbContext _context;

        public OrdersController(IOrderService orderService, AppDbContext context)
        {
            _orderService = orderService;
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<OrderDto>>> GetAll()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }

            if (User.IsInRole("Admin"))
            {
                var orders = await _orderService.GetAllAsync();
                return Ok(orders);
            }
            else
            {
                var orders = await _orderService.GetUserOrdersAsync(userId);
                return Ok(orders);
            }
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<OrderDetailsDto>> GetById(int id)
        {
            var order = await _orderService.GetByIdAsync(id);
            if (order == null)
            {
                return NotFound();
            }
            return Ok(order);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("admin")]
        public async Task<ActionResult<IEnumerable<OrderDto>>> GetAllAdmin()
        {
            var orders = await _orderService.GetAllAsync();
            return Ok(orders);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id:int}/status")]
        public async Task<IActionResult> UpdateStatus(int id, UpdateOrderStatusRequestDto dto)
        {
            var order = await _context.Orders
                .Include(o => o.OrderDetails)
                .FirstOrDefaultAsync(o => o.OrderId == id);
            if (order == null)
            {
                return NotFound();
            }

            order.StatusId = dto.StatusId;
            if (!string.IsNullOrWhiteSpace(dto.CancelReason))
            {
                order.CancelReason = dto.CancelReason;
            }

            // Auto-create invoice when order is marked as Delivered/Completed (statusId 4)
            if (dto.StatusId == 4)
            {
                var existingInvoice = await _context.Invoices
                    .FirstOrDefaultAsync(i => i.OrderId == id);

                if (existingInvoice == null)
                {
                    var invoice = new Invoice
                    {
                        OrderId = id,
                        InvoiceNumber = "INV-" + Guid.NewGuid().ToString().Substring(0, 8).ToUpper(),
                        InvoiceDate = DateTime.UtcNow,
                        TaxRate = 10,
                        SubTotal = order.SubTotal,
                        TaxAmount = order.TaxAmount,
                        TotalAmount = order.TotalAmount,
                        IsPaid = order.IsPaid,
                        GeneratedBy = order.CustomerId
                    };
                    await _context.Invoices.AddAsync(invoice);
                }
            }

            _context.Orders.Update(order);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost]
        public async Task<ActionResult<OrderDto>> Create(CreateOrderRequestDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }

            var order = await _orderService.CreateAsync(userId, dto);
            return CreatedAtAction(nameof(GetById), new { id = order.OrderId }, order);
        }

        [HttpPost("{id:int}/cancel")]
        public async Task<IActionResult> Cancel(int id)
        {
            try
            {
                await _orderService.CancelAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id:int}/payment-status")]
        public async Task<IActionResult> UpdatePaymentStatus(int id, UpdateOrderPaymentStatusRequestDto dto)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null)
            {
                return NotFound();
            }

            order.IsPaid = dto.IsPaid;
            _context.Orders.Update(order);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // --- Original user-specific orders endpoint (retained for compatibility) ---

        [HttpGet("user/{userId:int}")]
        public async Task<ActionResult<IEnumerable<OrderDto>>> GetUserOrders(int userId)
        {
            var orders = await _orderService.GetUserOrdersAsync(userId);
            return Ok(orders);
        }
    }

    public class UpdateOrderPaymentStatusRequestDto
    {
        public bool IsPaid { get; set; }
    }
}
