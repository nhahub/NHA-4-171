using System.Threading.Tasks;

namespace CarSparePartSysProject.Stripe
{
    public interface IStripeService
    {
        Task<string> CreateCheckoutSessionAsync(int orderId, string successUrl, string cancelUrl);
        Task<string> CreatePaymentIntentAsync(int orderId);
        Task<bool> RefundPaymentAsync(string paymentIntentId);
        Task<bool> HandleWebhookAsync(string json, string stripeSignature);
    }
}

