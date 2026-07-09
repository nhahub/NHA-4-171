using CarSparePartSys.Model;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;

namespace CarSparePartSysProject.DAL.Data
{
    public class AppDbContext : IdentityDbContext<User, Role, int>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        #region DbSets

        public DbSet<Category> Categories { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<ProductImage> ProductImages { get; set; }
        public DbSet<ProductSpecification> ProductSpecifications { get; set; }

        public DbSet<Supplier> Suppliers { get; set; }

        public DbSet<CarBrand> CarBrands { get; set; }
        public DbSet<CarModel> CarModels { get; set; }
        public DbSet<PartCompatibility> PartCompatibilities { get; set; }

        public DbSet<Cart> Carts { get; set; }
        public DbSet<CartItem> CartItems { get; set; }

        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderDetail> OrderDetails { get; set; }
        public DbSet<OrderStatus> OrderStatuses { get; set; }

        public DbSet<Payment> Payments { get; set; }
        public DbSet<PaymentMethod> PaymentMethods { get; set; }

        public DbSet<Invoice> Invoices { get; set; }

        public DbSet<Address> Addresses { get; set; }
        public DbSet<Shipping> Shippings { get; set; }

        public DbSet<Inventory> Inventories { get; set; }
        public DbSet<Warehouse> Warehouses { get; set; }
        public DbSet<StockTransaction> StockTransactions { get; set; }

        public DbSet<Review> Reviews { get; set; }

        public DbSet<Wishlist> Wishlists { get; set; }

        public DbSet<Coupon> Coupons { get; set; }

        public DbSet<ReturnRequest> ReturnRequests { get; set; }

        public DbSet<AuditLog> AuditLogs { get; set; }
        public DbSet<NewsletterSubscription> NewsletterSubscriptions { get; set; }


        #endregion

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            #region Unique Indexes

            modelBuilder.Entity<Product>()
                .HasIndex(x => x.SKU)
                .IsUnique();

            modelBuilder.Entity<Order>()
                .HasIndex(x => x.OrderNumber)
                .IsUnique();

            modelBuilder.Entity<Invoice>()
                .HasIndex(x => x.InvoiceNumber)
                .IsUnique();

            modelBuilder.Entity<Coupon>()
                .HasIndex(x => x.Code)
                .IsUnique();

            modelBuilder.Entity<Cart>()
                .HasIndex(x => x.UserId)
                .IsUnique();

            modelBuilder.Entity<Shipping>()
                .HasIndex(x => x.OrderId)
                .IsUnique();

            modelBuilder.Entity<Inventory>()
                .HasIndex(x => new { x.ProductId, x.WarehouseId })
                .IsUnique();

            modelBuilder.Entity<Wishlist>()
                .HasIndex(x => new { x.UserId, x.ProductId })
                .IsUnique();

            modelBuilder.Entity<Review>()
                .HasIndex(x => new { x.UserId, x.ProductId })
                .IsUnique();

            modelBuilder.Entity<CartItem>()
                .HasIndex(x => new { x.CartId, x.ProductId })
                .IsUnique();

            modelBuilder.Entity<PartCompatibility>()
                .HasIndex(x => new { x.ProductId, x.ModelId })
                .IsUnique();

            #endregion

            #region One To One

            modelBuilder.Entity<Cart>()
                .HasOne(x => x.User)
                .WithOne(x => x.Cart)
                .HasForeignKey<Cart>(x => x.UserId);

            modelBuilder.Entity<Invoice>()
                .HasOne(x => x.Order)
                .WithOne(x => x.Invoice)
                .HasForeignKey<Invoice>(x => x.OrderId);

            modelBuilder.Entity<Shipping>()
                .HasOne(x => x.Order)
                .WithOne(x => x.Shipping)
                .HasForeignKey<Shipping>(x => x.OrderId);

            #endregion

            #region User

            modelBuilder.Entity<User>()
                .HasOne(x => x.Role)
                .WithMany(x => x.Users)
                .HasForeignKey(x => x.RoleId)
                .OnDelete(DeleteBehavior.Restrict);

            #endregion

            #region Address

            modelBuilder.Entity<Address>()
                .HasOne(x => x.User)
                .WithMany(x => x.Addresses)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            #endregion

            #region Category

            modelBuilder.Entity<Category>()
                .HasOne(x => x.ParentCategory)
                .WithMany(x => x.SubCategories)
                .HasForeignKey(x => x.ParentCategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            #endregion

            #region Product

            modelBuilder.Entity<Product>()
                .HasOne(x => x.Category)
                .WithMany(x => x.Products)
                .HasForeignKey(x => x.CategoryId);

            modelBuilder.Entity<Product>()
                .HasOne(x => x.Supplier)
                .WithMany(x => x.Products)
                .HasForeignKey(x => x.SupplierId);

            #endregion

            #region Product Images

            modelBuilder.Entity<ProductImage>()
                .HasOne(x => x.Product)
                .WithMany(x => x.Images)
                .HasForeignKey(x => x.ProductId);

            modelBuilder.Entity<ProductSpecification>()
                .HasOne(x => x.Product)
                .WithMany(x => x.Specifications)
                .HasForeignKey(x => x.ProductId);

            #endregion

            #region Car

            modelBuilder.Entity<CarModel>()
                .HasOne(x => x.Brand)
                .WithMany(x => x.Models)
                .HasForeignKey(x => x.BrandId);

            modelBuilder.Entity<PartCompatibility>()
                .HasOne(x => x.Product)
                .WithMany(x => x.PartCompatibilities)
                .HasForeignKey(x => x.ProductId);

            modelBuilder.Entity<PartCompatibility>()
                .HasOne(x => x.CarModel)
                .WithMany(x => x.PartCompatibilities)
                .HasForeignKey(x => x.ModelId);

            #endregion

            #region Inventory

            modelBuilder.Entity<Inventory>()
                .HasOne(x => x.Product)
                .WithMany(x => x.Inventories)
                .HasForeignKey(x => x.ProductId);

            modelBuilder.Entity<Inventory>()
                .HasOne(x => x.Warehouse)
                .WithMany(x => x.Inventories)
                .HasForeignKey(x => x.WarehouseId);

            #endregion

            #region Cart

            modelBuilder.Entity<CartItem>()
                .HasOne(x => x.Cart)
                .WithMany(x => x.CartItems)
                .HasForeignKey(x => x.CartId);

            modelBuilder.Entity<CartItem>()
                .HasOne(x => x.Product)
                .WithMany()
                .HasForeignKey(x => x.ProductId);

            #endregion

            #region Orders

            modelBuilder.Entity<Order>()
                .HasOne(x => x.Customer)
                .WithMany(x => x.Orders)
                .HasForeignKey(x => x.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Order>()
                .HasOne(x => x.Processor)
                .WithMany()
                .HasForeignKey(x => x.ProcessedBy)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Order>()
                .HasOne(x => x.Status)
                .WithMany(x => x.Orders)
                .HasForeignKey(x => x.StatusId);

            modelBuilder.Entity<Order>()
                .HasOne(x => x.ShippingAddress)
                .WithMany(x => x.ShippingOrders)
                .HasForeignKey(x => x.ShippingAddressId);

            modelBuilder.Entity<Order>()
                .HasOne(x => x.Coupon)
                .WithMany(x => x.Orders)
                .HasForeignKey(x => x.CouponId);

            #endregion

            #region Order Details

            modelBuilder.Entity<OrderDetail>()
                .HasOne(x => x.Order)
                .WithMany(x => x.OrderDetails)
                .HasForeignKey(x => x.OrderId);

            modelBuilder.Entity<OrderDetail>()
                .HasOne(x => x.Product)
                .WithMany(x => x.OrderDetails)
                .HasForeignKey(x => x.ProductId);

            #endregion

            #region Payment

            modelBuilder.Entity<Payment>()
                .HasOne(x => x.Order)
                .WithMany(x => x.Payments)
                .HasForeignKey(x => x.OrderId);

            modelBuilder.Entity<Payment>()
                .HasOne(x => x.PaymentMethod)
                .WithMany(x => x.Payments)
                .HasForeignKey(x => x.PaymentMethodId);

            #endregion

            #region Invoice

            modelBuilder.Entity<Invoice>()
                .HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.GeneratedBy)
                .OnDelete(DeleteBehavior.Restrict);

            #endregion

            #region Review

            modelBuilder.Entity<Review>()
                .HasOne(x => x.User)
                .WithMany(x => x.Reviews)
                .HasForeignKey(x => x.UserId);

            modelBuilder.Entity<Review>()
                .HasOne(x => x.Product)
                .WithMany(x => x.Reviews)
                .HasForeignKey(x => x.ProductId);

            modelBuilder.Entity<Review>()
                .ToTable(t =>
                    t.HasCheckConstraint("CK_Review_Rating", "[Rating] BETWEEN 1 AND 5"));

            #endregion

            #region Wishlist

            modelBuilder.Entity<Wishlist>()
                .HasOne(x => x.User)
                .WithMany(x => x.WishlistItems)
                .HasForeignKey(x => x.UserId);

            modelBuilder.Entity<Wishlist>()
                .HasOne(x => x.Product)
                .WithMany(x => x.WishlistedBy)
                .HasForeignKey(x => x.ProductId);

            #endregion

            #region Return Request

            modelBuilder.Entity<ReturnRequest>()
                .HasOne(x => x.User)
                .WithMany(x => x.ReturnRequests)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ReturnRequest>()
                .HasOne(x => x.Processor)
                .WithMany()
                .HasForeignKey(x => x.ProcessedBy)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ReturnRequest>()
                .HasOne(x => x.OrderDetail)
                .WithMany(x => x.ReturnRequests)
                .HasForeignKey(x => x.OrderDetailId);

            #endregion

            #region Stock

            modelBuilder.Entity<StockTransaction>()
                .HasOne(x => x.Product)
                .WithMany(x => x.StockTransactions)
                .HasForeignKey(x => x.ProductId);

            modelBuilder.Entity<StockTransaction>()
                .HasOne(x => x.User)
                .WithMany(x => x.StockTransactions)
                .HasForeignKey(x => x.CreatedBy)
                .OnDelete(DeleteBehavior.Restrict);
            #endregion

            #region Audit Log

            modelBuilder.Entity<AuditLog>()
                .HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.SetNull);

            #endregion

            #region Decimal Precision

            modelBuilder.Entity<Product>().Property(x => x.UnitPrice).HasPrecision(18, 2);
            modelBuilder.Entity<Product>().Property(x => x.CostPrice).HasPrecision(18, 2);

            modelBuilder.Entity<Order>().Property(x => x.SubTotal).HasPrecision(18, 2);
            modelBuilder.Entity<Order>().Property(x => x.TaxAmount).HasPrecision(18, 2);
            modelBuilder.Entity<Order>().Property(x => x.DiscountAmount).HasPrecision(18, 2);
            modelBuilder.Entity<Order>().Property(x => x.TotalAmount).HasPrecision(18, 2);

            modelBuilder.Entity<OrderDetail>().Property(x => x.UnitPrice).HasPrecision(18, 2);
            modelBuilder.Entity<OrderDetail>().Property(x => x.Discount).HasPrecision(18, 2);
            modelBuilder.Entity<OrderDetail>().Property(x => x.LineTotal).HasPrecision(18, 2);

            modelBuilder.Entity<Invoice>().Property(x => x.SubTotal).HasPrecision(18, 2);
            modelBuilder.Entity<Invoice>().Property(x => x.TaxAmount).HasPrecision(18, 2);
            modelBuilder.Entity<Invoice>().Property(x => x.TotalAmount).HasPrecision(18, 2);
            modelBuilder.Entity<Invoice>().Property(x => x.TaxRate).HasPrecision(18, 2);

            modelBuilder.Entity<Payment>().Property(x => x.Amount).HasPrecision(18, 2);

            modelBuilder.Entity<Shipping>().Property(x => x.ShippingCost).HasPrecision(18, 2);

            modelBuilder.Entity<Coupon>().Property(x => x.DiscountValue).HasPrecision(18, 2);
            modelBuilder.Entity<Coupon>().Property(x => x.MinOrderAmount).HasPrecision(18, 2);
            modelBuilder.Entity<Coupon>().Property(x => x.MaxDiscountAmount).HasPrecision(18, 2);

            modelBuilder.Entity<ReturnRequest>().Property(x => x.RefundAmount).HasPrecision(18, 2);

            #endregion
        }
    }
}