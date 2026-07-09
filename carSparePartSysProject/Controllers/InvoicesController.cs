using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CarSparePartSys.Model;
using CarSparePartSysProject.DAL.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.IO;
using System.Text;
using System.Threading.Tasks;

namespace CarSparePartSysProject.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/orders/{orderId:int}/invoice")]
    public class InvoicesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public InvoicesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<object>> GetInvoice(int orderId)
        {
            var invoice = await _context.Invoices
                .Include(i => i.Order)
                .FirstOrDefaultAsync(i => i.OrderId == orderId);

            if (invoice == null)
            {
                var order = await _context.Orders
                    .Include(o => o.OrderDetails)
                    .FirstOrDefaultAsync(o => o.OrderId == orderId);

                if (order == null)
                {
                    return NotFound("Order not found.");
                }

                invoice = new Invoice
                {
                    OrderId = orderId,
                    InvoiceNumber = "INV-" + Guid.NewGuid().ToString().Substring(0, 8).ToUpper(),
                    InvoiceDate = DateTime.UtcNow,
                    TaxRate = 10, // 10% default tax
                    SubTotal = order.SubTotal,
                    TaxAmount = order.TaxAmount,
                    TotalAmount = order.TotalAmount,
                    IsPaid = order.IsPaid,
                    GeneratedBy = order.CustomerId
                };

                await _context.Invoices.AddAsync(invoice);
                await _context.SaveChangesAsync();
            }

            return Ok(new
            {
                invoice.InvoiceId,
                invoice.OrderId,
                invoice.InvoiceNumber,
                invoice.InvoiceDate,
                invoice.TaxRate,
                invoice.SubTotal,
                invoice.TaxAmount,
                invoice.TotalAmount,
                invoice.IsPaid
            });
        }

        [HttpGet("download")]
        public async Task<IActionResult> DownloadInvoice(int orderId)
        {
            var invoice = await _context.Invoices
                .Include(i => i.Order)
                .FirstOrDefaultAsync(i => i.OrderId == orderId);

            if (invoice == null)
            {
                var order = await _context.Orders
                    .Include(o => o.OrderDetails)
                    .FirstOrDefaultAsync(o => o.OrderId == orderId);

                if (order == null)
                {
                    return NotFound("Order not found.");
                }

                invoice = new Invoice
                {
                    OrderId = orderId,
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
                await _context.SaveChangesAsync();
            }

            var builder = new StringBuilder();
            builder.AppendLine("=========================================");
            builder.AppendLine($"INVOICE: {invoice.InvoiceNumber}");
            builder.AppendLine($"DATE: {invoice.InvoiceDate:yyyy-MM-dd HH:mm:ss}");
            builder.AppendLine($"ORDER ID: {invoice.OrderId}");
            builder.AppendLine("=========================================");
            builder.AppendLine($"SUBTOTAL: ${invoice.SubTotal:F2}");
            builder.AppendLine($"TAX ({invoice.TaxRate}%): ${invoice.TaxAmount:F2}");
            builder.AppendLine($"TOTAL AMOUNT: ${invoice.TotalAmount:F2}");
            builder.AppendLine($"PAYMENT STATUS: {(invoice.IsPaid ? "Paid" : "Unpaid")}");
            builder.AppendLine("=========================================");
            builder.AppendLine("Thank you for your business!");

            var bytes = Encoding.UTF8.GetBytes(builder.ToString());
            return File(bytes, "text/plain", $"Invoice-{invoice.InvoiceNumber}.txt");
        }
    }
}
