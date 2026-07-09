using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CarSparePartSys.Model;
using CarSparePartSysProject.DAL.Data;
using CarSparePartSysProject.Models.Dto.Returns;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace CarSparePartSysProject.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ReturnsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ReturnsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ReturnRequestDto>>> GetUserReturns()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }

            var returns = await _context.ReturnRequests
                .Include(r => r.OrderDetail)
                    .ThenInclude(od => od.Product)
                .Where(r => r.UserId == userId)
                .OrderByDescending(r => r.RequestDate)
                .ToListAsync();

            return Ok(returns.Select(r => new ReturnRequestDto
            {
                ReturnId = r.ReturnId,
                OrderId = r.OrderDetail.OrderId,
                ProductId = r.OrderDetail.ProductId,
                ProductName = r.OrderDetail.Product?.ProductName ?? "Unknown Product",
                Quantity = r.Quantity,
                Reason = r.Reason,
                Status = r.Status,
                RefundAmount = r.RefundAmount,
                RequestDate = r.RequestDate
            }));
        }

        [HttpPost]
        public async Task<ActionResult<ReturnRequestDto>> Create(CreateReturnRequestDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }

            var orderDetail = await _context.OrderDetails
                .Include(od => od.Product)
                .FirstOrDefaultAsync(od => od.OrderDetailId == dto.OrderDetailId);

            if (orderDetail == null)
            {
                return NotFound("OrderDetail not found.");
            }

            var ret = new ReturnRequest
            {
                OrderDetailId = dto.OrderDetailId,
                UserId = userId,
                Quantity = dto.Quantity,
                Reason = dto.Reason,
                Status = "Requested",
                RequestDate = DateTime.UtcNow
            };

            await _context.ReturnRequests.AddAsync(ret);
            await _context.SaveChangesAsync();

            return Ok(new ReturnRequestDto
            {
                ReturnId = ret.ReturnId,
                OrderId = orderDetail.OrderId,
                ProductId = orderDetail.ProductId,
                ProductName = orderDetail.Product?.ProductName ?? "",
                Quantity = ret.Quantity,
                Reason = ret.Reason,
                Status = ret.Status,
                RequestDate = ret.RequestDate
            });
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("admin")]
        public async Task<ActionResult<IEnumerable<ReturnRequestDto>>> GetAdminReturns()
        {
            var returns = await _context.ReturnRequests
                .Include(r => r.OrderDetail)
                    .ThenInclude(od => od.Product)
                .OrderByDescending(r => r.RequestDate)
                .ToListAsync();

            return Ok(returns.Select(r => new ReturnRequestDto
            {
                ReturnId = r.ReturnId,
                OrderId = r.OrderDetail.OrderId,
                ProductId = r.OrderDetail.ProductId,
                ProductName = r.OrderDetail.Product?.ProductName ?? "Unknown Product",
                Quantity = r.Quantity,
                Reason = r.Reason,
                Status = r.Status,
                RefundAmount = r.RefundAmount,
                RequestDate = r.RequestDate
            }));
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateStatus(int id, UpdateReturnRequestDto dto)
        {
            var ret = await _context.ReturnRequests.FindAsync(id);
            if (ret == null)
            {
                return NotFound();
            }

            ret.Status = dto.Status;
            ret.RefundAmount = dto.RefundAmount ?? ret.RefundAmount;
            ret.Notes = dto.Notes ?? ret.Notes;
            ret.ProcessedDate = DateTime.UtcNow;

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdClaim, out int adminId))
            {
                ret.ProcessedBy = adminId;
            }

            _context.ReturnRequests.Update(ret);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
