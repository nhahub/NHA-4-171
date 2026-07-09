using Microsoft.AspNetCore.Mvc;
using System.IO;
using System.Threading.Tasks;
using CarSparePartSysProject.Stripe;

namespace CarSparePartSysProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StripeController : ControllerBase
    {
        private readonly IStripeService _stripeService;

        public StripeController(IStripeService stripeService)
        {
            _stripeService = stripeService;
        }

        [HttpPost("checkout-session/{orderId:int}")]
        public async Task<IActionResult> CreateCheckoutSession(int orderId, [FromQuery] string successUrl, [FromQuery] string cancelUrl)
        {
            try
            {
                var sessionUrl = await _stripeService.CreateCheckoutSessionAsync(orderId, successUrl, cancelUrl);
                return Ok(new { url = sessionUrl });
            }
            catch (KeyNotFoundException)
            {
                return NotFound("Order not found.");
            }
            catch (System.Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("payment-intent/{orderId:int}")]
        public async Task<IActionResult> CreatePaymentIntent(int orderId)
        {
            try
            {
                var clientSecret = await _stripeService.CreatePaymentIntentAsync(orderId);
                return Ok(new { clientSecret });
            }
            catch (KeyNotFoundException)
            {
                return NotFound("Order not found.");
            }
            catch (System.Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("webhook")]
        public async Task<IActionResult> StripeWebhook()
        {
            var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
            var stripeSignature = Request.Headers["Stripe-Signature"];

            if (string.IsNullOrEmpty(stripeSignature))
            {
                return BadRequest("Missing Stripe-Signature header.");
            }

            var handled = await _stripeService.HandleWebhookAsync(json, stripeSignature.ToString());
            if (handled)
            {
                return Ok();
            }

            return BadRequest("Webhook processing failed or event type ignored.");
        }
    }
}
