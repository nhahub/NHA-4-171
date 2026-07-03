using CarSparePartSysProject.Configuration;
using CarSparePartSysProject.Stripe;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Stripe;

namespace CarSparePartSysProject.Extensions
{
    public static class StripeExtensions
    {
        public static IServiceCollection AddStripeServices(this IServiceCollection services, IConfiguration configuration)
        {
            var stripeSection = configuration.GetSection("Stripe");
            services.Configure<StripeSetting>(stripeSection);

            var secretKey = stripeSection.GetValue<string>("Secretkey") ?? string.Empty;
            StripeConfiguration.ApiKey = secretKey;

            services.AddScoped<IStripeService, StripeService>();

            return services;
        }
    }
}
