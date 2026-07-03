using Microsoft.Extensions.DependencyInjection;

namespace CarSparePartSysProject.Extensions
{
    public static class AuthorizationExtensions
    {
        public static IServiceCollection AddCustomAuthorizationPolicies(this IServiceCollection services)
        {
            services.AddAuthorization(options =>
            {
                options.AddPolicy("RequireAdmin", policy =>
                    policy.RequireRole("Admin"));

                options.AddPolicy("RequireSupplier", policy =>
                    policy.RequireRole("Admin", "Supplier"));

                options.AddPolicy("RequireUser", policy =>
                    policy.RequireRole("Admin", "User"));
            });

            return services;
        }
    }
}
