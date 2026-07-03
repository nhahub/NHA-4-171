using CarSparePartSysProject.BL.IServices;
using Microsoft.Extensions.Options;
using Stripe;
using Stripe.Checkout;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CarSparePartSysProject.Stripe
{
    public class StripeService : IStripeService
    {
        private readonly StripeSetting _stripeSettings;
        private readonly IOrderService _orderService;

        public StripeService(
            IOptions<StripeSetting> stripeSettings,
            IOrderService orderService)
        {
            _stripeSettings = stripeSettings.Value;
            _orderService = orderService;
            StripeConfiguration.ApiKey = _stripeSettings.SecretKey;
        }

        public async Task<string> CreateCheckoutSessionAsync(int orderId, string successUrl, string cancelUrl)
        {
            var order = await _orderService.GetOrderWithDetailsAsync(orderId);
            if (order == null)
            {
                throw new KeyNotFoundException($"Order {orderId} not found.");
            }

            var options = new SessionCreateOptions
            {
                PaymentMethodTypes = new List<string> { "card" },
                LineItems = order.OrderDetails.Select(od => new SessionLineItemOptions
                {
                    PriceData = new SessionLineItemPriceDataOptions
                    {
                        UnitAmount = (long)(od.UnitPrice * 100),
                        Currency = "usd",
                        ProductData = new SessionLineItemPriceDataProductDataOptions
                        {
                            Name = od.Product?.ProductName ?? $"Product ID {od.ProductId}",
                            Description = od.Product?.Description ?? "Spare Part"
                        }
                    },
                    Quantity = od.Quantity
                }).ToList(),
                Mode = "payment",
                SuccessUrl = successUrl + "?session_id={CHECKOUT_SESSION_ID}&orderId=" + order.OrderId,
                CancelUrl = cancelUrl,
                ClientReferenceId = order.OrderId.ToString()
            };

            var service = new SessionService();
            var session = await service.CreateAsync(options);
            return session.Url;
        }

        public async Task<string> CreatePaymentIntentAsync(int orderId)
        {
            var order = await _orderService.GetOrderWithDetailsAsync(orderId);
            if (order == null)
            {
                throw new KeyNotFoundException($"Order {orderId} not found.");
            }

            var options = new PaymentIntentCreateOptions
            {
                Amount = (long)(order.TotalAmount * 100),
                Currency = "usd",
                Metadata = new Dictionary<string, string>
                {
                    { "OrderId", order.OrderId.ToString() },
                    { "OrderNumber", order.OrderNumber }
                }
            };

            var service = new PaymentIntentService();
            var intent = await service.CreateAsync(options);
            return intent.ClientSecret;
        }

        public async Task<bool> RefundPaymentAsync(string paymentIntentId)
        {
            var options = new RefundCreateOptions
            {
                PaymentIntent = paymentIntentId
            };

            var service = new RefundService();
            var refund = await service.CreateAsync(options);
            return refund.Status == "succeeded";
        }

        public async Task<bool> HandleWebhookAsync(string json, string stripeSignature)
        {
            try
            {
                var stripeEvent = EventUtility.ConstructEvent(json, stripeSignature, _stripeSettings.WebhookSecret);

                if (stripeEvent.Type == "checkout.session.completed")
                {
                    var session = stripeEvent.Data.Object as Session;
                    if (session != null && !string.IsNullOrEmpty(session.ClientReferenceId))
                    {
                        var orderId = int.Parse(session.ClientReferenceId);
                        var order = await _orderService.GetOrderWithDetailsAsync(orderId);
                        if (order != null)
                        {
                            await _orderService.MarkOrderAsPaidAsync(orderId);
                            await _orderService.RecordStripePaymentAsync(orderId, order.TotalAmount);
                            return true;
                        }
                    }
                }
                else if (stripeEvent.Type == "payment_intent.succeeded")
                {
                    var intent = stripeEvent.Data.Object as PaymentIntent;
                    if (intent != null && intent.Metadata.TryGetValue("OrderId", out string? orderIdStr) && int.TryParse(orderIdStr, out int orderId))
                    {
                        var order = await _orderService.GetOrderWithDetailsAsync(orderId);
                        if (order != null && !order.IsPaid)
                        {
                            await _orderService.MarkOrderAsPaidAsync(orderId);
                            await _orderService.RecordStripePaymentAsync(orderId, order.TotalAmount);
                            return true;
                        }
                    }
                }

                return false;
            }
            catch (Exception)
            {
                return false;
            }
        }
    }
}
