using CarSparePartSysProject.DAL.Repositories.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System.IO;
using System.Threading.Tasks;
using CarSparePartSysProject.Configuration;
using CarSparePartSysProject.Stripe;

namespace CarSparePartSysProject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StripeController : ControllerBase
    {
        private readonly IStripeService _stripeService;
        private readonly IOrderRepository _orderRepository;
        private readonly StripeSetting _stripeSettings;

        public StripeController(
            IStripeService stripeService,
            IOrderRepository orderRepository,
            IOptions<StripeSetting> stripeSettings)
        {
            _stripeService = stripeService;
            _orderRepository = orderRepository;
            _stripeSettings = stripeSettings.Value;
        }

        [HttpPost("checkout-session/{orderId:int}")]
        public async Task<IActionResult> CreateCheckoutSession(int orderId, [FromQuery] string successUrl, [FromQuery] string cancelUrl)
        {
            var order = await _orderRepository.GetByIdAsync(orderId);
            if (order == null)
            {
                return NotFound("Order not found.");
            }

            try
            {
                var sessionUrl = await _stripeService.CreateCheckoutSessionAsync(order, successUrl, cancelUrl);
                return Ok(new { url = sessionUrl });
            }
            catch (System.Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("payment-intent/{orderId:int}")]
        public async Task<IActionResult> CreatePaymentIntent(int orderId)
        {
            var order = await _orderRepository.GetByIdAsync(orderId);
            if (order == null)
            {
                return NotFound("Order not found.");
            }

            try
            {
                var clientSecret = await _stripeService.CreatePaymentIntentAsync(order);
                return Ok(new { clientSecret });
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

            var handled = await _stripeService.HandleWebhookAsync(json, stripeSignature.ToString(), _stripeSettings.WebhookSecret);
            if (handled)
            {
                return Ok();
            }

            return BadRequest("Webhook processing failed or event type ignored.");
        }
    }
}
