using CarSparePartSys.Model;
using System.Threading.Tasks;

namespace CarSparePartSysProject.Stripe
{
    public interface IStripeService
    {
        Task<string> CreateCheckoutSessionAsync(Order order, string successUrl, string cancelUrl);
        Task<string> CreatePaymentIntentAsync(Order order);
        Task<bool> RefundPaymentAsync(string paymentIntentId);
        Task<bool> HandleWebhookAsync(string json, string stripeSignature, string webhookSecret);
    }
}
