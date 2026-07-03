using CarSparePartSysProject.Configuration;

namespace CarSparePartSysProject.Extensions
{
    public static class CloudinaryExtensions
    {
        public static IServiceCollection AddCloudinaryServices(this IServiceCollection services, IConfiguration configuration)
        {
            services.Configure<CloudinarySettingscs>(
                configuration.GetSection("CloudinarySettings"));

            return services;
        }
    }
}
