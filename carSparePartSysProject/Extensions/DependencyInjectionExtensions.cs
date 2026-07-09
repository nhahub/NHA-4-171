using CarSparePartSysProject.BL.Service;
using CarSparePartSysProject.BL.IServices;
using CarSparePartSysProject.BL.Service.IService;
using CarSparePartSysProject.DAL.Repositories.Interfaces;
using CarSparePartSysProject.DAL.Repositories.Sql;
using CarSparePartSysProject.DAL.Repositories.Authentication;

namespace CarSparePartSysProject.Extensions
{
    public static class DependencyInjectionExtensions
    {
        public static IServiceCollection AddRepositories(this IServiceCollection services)
        {
            services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
            services.AddScoped<IProductRepository, SqlProductRepository>();
            services.AddScoped<ICategoryRepository, SqlCategoryRepository>();
            services.AddScoped<ICartRepository, SqlCartRepository>();
            services.AddScoped<ICouponRepository, SqlCouponRepository>();
            services.AddScoped<IOrderRepository, SqlOrderRepository>();
            services.AddScoped<IReviewRepository, SqlReviewRepository>();
            services.AddScoped<IWishlistRepository, SqlWishlistRepository>();
            services.AddScoped<IAddressRepository, SqlAddressRepository>();
            services.AddScoped<IInventoryRepository, SqlInventoryRepository>();
            services.AddScoped<IPaymentRepository, SqlPaymentRepository>();
            services.AddScoped<IShippingRepository, SqlShippingRepository>();
            services.AddScoped<ISupplierRepository, SqlSupplierRepository>();
            services.AddScoped<ITokenRepository, TokenRepository>();

            return services;
        }

        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            services.AddScoped<IAccountService, AccountService>();
            services.AddScoped<IAddressService, AddressService>();
            services.AddScoped<ICartService, CartService>();
            services.AddScoped<ICategoryService, CategoryService>();
            services.AddScoped<ICouponService, CouponService>();
            services.AddScoped<IInventoryService, InventoryService>();
            services.AddScoped<IOrderService, OrderService>();
            services.AddScoped<IPaymentService, PaymentService>();
            services.AddScoped<IProductService, ProductService>();
            services.AddScoped<IReviewService, ReviewService>();
            services.AddScoped<IShippingService, ShippingService>();
            services.AddScoped<ISupplierService, SupplierService>();
            services.AddScoped<IWishlistService, WishlistService>();

            return services;
        }
    }
}
