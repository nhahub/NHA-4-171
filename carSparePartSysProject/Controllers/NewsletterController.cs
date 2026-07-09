using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CarSparePartSysProject.DAL.Data;
using CarSparePartSys.Model;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;

namespace CarSparePartSysProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NewsletterController : ControllerBase
    {
        private readonly AppDbContext _context;

        public NewsletterController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("subscribe")]
        [AllowAnonymous]
        public async Task<IActionResult> Subscribe([FromBody] SubscribeRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var emailNormalized = request.Email.Trim().ToLower();
            var existing = await _context.NewsletterSubscriptions
                .FirstOrDefaultAsync(s => s.Email.ToLower() == emailNormalized);

            if (existing != null)
            {
                return Ok(new { message = "You are already subscribed to our newsletter." });
            }

            var subscription = new NewsletterSubscription
            {
                Email = request.Email.Trim(),
                SubscribedAt = DateTime.UtcNow,
                IsContacted = false
            };

            await _context.NewsletterSubscriptions.AddAsync(subscription);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Successfully subscribed to our newsletter!" });
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("subscriptions")]
        public async Task<IActionResult> GetSubscriptions()
        {
            var subscriptions = await _context.NewsletterSubscriptions
                .OrderByDescending(s => s.SubscribedAt)
                .ToListAsync();

            return Ok(subscriptions);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("subscriptions/{id:int}/contact")]
        public async Task<IActionResult> ToggleContact(int id, [FromBody] ToggleContactRequest request)
        {
            var sub = await _context.NewsletterSubscriptions.FindAsync(id);
            if (sub == null) return NotFound();

            sub.IsContacted = request.IsContacted;
            _context.NewsletterSubscriptions.Update(sub);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Contact status updated." });
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("subscriptions/{id:int}")]
        public async Task<IActionResult> DeleteSubscription(int id)
        {
            var sub = await _context.NewsletterSubscriptions.FindAsync(id);
            if (sub == null)
            {
                return NotFound();
            }

            _context.NewsletterSubscriptions.Remove(sub);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }

    public class SubscribeRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = null!;
    }

    public class ToggleContactRequest
    {
        public bool IsContacted { get; set; }
    }
}
