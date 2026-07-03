using CarSparePartSys.Model;
using CarSparePartSysProject.BL.IServices;
using CarSparePartSysProject.Stripe;
using FluentAssertions;
using Microsoft.Extensions.Options;
using Moq;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace CarSparePartSys.Tests
{
    public class StripeTests
    {
        private readonly Mock<IOrderService> _orderServiceMock;
        private readonly IOptions<StripeSetting> _stripeOptions;
        private readonly StripeService _stripeService;

        public StripeTests()
        {
            _orderServiceMock = new Mock<IOrderService>();
            
            var settings = new StripeSetting
            {
                SecretKey = "sk_test_mock_secret_key",
                PublishableKey = "pk_test_mock_pub_key",
                WebhookSecret = "whsec_mock_webhook_secret"
            };
            _stripeOptions = Options.Create(settings);
            _stripeService = new StripeService(_stripeOptions, _orderServiceMock.Object);
        }

        [Fact]
        public async Task CreateCheckoutSessionAsync_InvalidOrderId_ThrowsKeyNotFoundException()
        {
            // Arrange
            var orderId = 999;
            _orderServiceMock.Setup(s => s.GetOrderWithDetailsAsync(orderId)).ReturnsAsync((Order?)null);

            // Act & Assert
            await Assert.ThrowsAsync<KeyNotFoundException>(() => 
                _stripeService.CreateCheckoutSessionAsync(orderId, "http://success", "http://cancel"));
        }

        [Fact]
        public async Task CreatePaymentIntentAsync_InvalidOrderId_ThrowsKeyNotFoundException()
        {
            // Arrange
            var orderId = 999;
            _orderServiceMock.Setup(s => s.GetOrderWithDetailsAsync(orderId)).ReturnsAsync((Order?)null);

            // Act & Assert
            await Assert.ThrowsAsync<KeyNotFoundException>(() => 
                _stripeService.CreatePaymentIntentAsync(orderId));
        }

        [Fact]
        public async Task HandleWebhookAsync_InvalidSignature_ReturnsFalse()
        {
            // Arrange
            var invalidSignature = "t=123,v1=badsign";
            var jsonPayload = "{\"id\": \"evt_123\"}";

            // Act
            var result = await _stripeService.HandleWebhookAsync(jsonPayload, invalidSignature);

            // Assert
            result.Should().BeFalse(); // Fails signature validation
        }
    }
}
