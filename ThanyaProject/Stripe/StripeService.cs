using CarSparePartSys.Model;
using CarSparePartSysProject.DAL.Repositories.Interfaces;
using Microsoft.Extensions.Options;
using Stripe;
using Stripe.Checkout;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CarSparePartSysProject.Configuration;

namespace CarSparePartSysProject.Stripe
{
    public class StripeService : IStripeService
    {
        private readonly StripeSetting _stripeSettings;
        private readonly IOrderRepository _orderRepository;
        private readonly IPaymentRepository _paymentRepository;

        public StripeService(
            IOptions<StripeSetting> stripeSettings,
            IOrderRepository orderRepository,
            IPaymentRepository paymentRepository)
        {
            _stripeSettings = stripeSettings.Value;
            _orderRepository = orderRepository;
            _paymentRepository = paymentRepository;
            StripeConfiguration.ApiKey = _stripeSettings.SecretKey;
        }

        public async Task<string> CreateCheckoutSessionAsync(Order order, string successUrl, string cancelUrl)
        {
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

        public async Task<string> CreatePaymentIntentAsync(Order order)
        {
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

        public async Task<bool> HandleWebhookAsync(string json, string stripeSignature, string webhookSecret)
        {
            try
            {
                var stripeEvent = EventUtility.ConstructEvent(json, stripeSignature, webhookSecret);

                if (stripeEvent.Type == "checkout.session.completed")
                {
                    var session = stripeEvent.Data.Object as Session;
                    if (session != null && !string.IsNullOrEmpty(session.ClientReferenceId))
                    {
                        var orderId = int.Parse(session.ClientReferenceId);
                        var order = await _orderRepository.GetByIdAsync(orderId);
                        if (order != null)
                        {
                            order.IsPaid = true;
                            _orderRepository.Update(order);
                            await _orderRepository.SaveAsync();

                            // Record payment details
                            var payment = new Payment
                            {
                                OrderId = orderId,
                                Amount = order.TotalAmount,
                                PaymentMethodId = 1,
                                Status = "Succeeded",
                                PaymentDate = DateTime.UtcNow
                            };
                            await _paymentRepository.AddAsync(payment);
                            await _paymentRepository.SaveAsync();

                            return true;
                        }
                    }
                }
                else if (stripeEvent.Type == "payment_intent.succeeded")
                {
                    var intent = stripeEvent.Data.Object as PaymentIntent;
                    if (intent != null && intent.Metadata.TryGetValue("OrderId", out string? orderIdStr) && int.TryParse(orderIdStr, out int orderId))
                    {
                        var order = await _orderRepository.GetByIdAsync(orderId);
                        if (order != null && !order.IsPaid)
                        {
                            order.IsPaid = true;
                            _orderRepository.Update(order);
                            await _orderRepository.SaveAsync();

                            var payment = new Payment
                            {
                                OrderId = orderId,
                                Amount = order.TotalAmount,
                                PaymentMethodId = 1,
                                Status = "Succeeded",
                                PaymentDate = DateTime.UtcNow
                            };
                            await _paymentRepository.AddAsync(payment);
                            await _paymentRepository.SaveAsync();

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
