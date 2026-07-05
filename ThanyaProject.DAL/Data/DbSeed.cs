using Microsoft.AspNetCore.Identity;
using System;
using System.Threading.Tasks;
using CarSparePartSys.Model;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;

namespace CarSparePartSysProject.DAL.Data
{
    public class DbSeed
    {
        public static async Task SeedRolesAsync(RoleManager<Role> roleManager)
        {
            if (!await roleManager.RoleExistsAsync("Admin"))
            {
                await roleManager.CreateAsync(new Role { Name = "Admin", Description = "System Administrator" });
            }
            if (!await roleManager.RoleExistsAsync("Supplier"))
            {
                await roleManager.CreateAsync(new Role { Name = "Supplier", Description = "Parts Supplier" });
            }
            if (!await roleManager.RoleExistsAsync("User"))
            {
                await roleManager.CreateAsync(new Role { Name = "User", Description = "Standard Customer" });
            }
        }

        public static async Task SeedAdminAsync(
            UserManager<User> userManager, 
            RoleManager<Role> roleManager, 
            Microsoft.Extensions.Configuration.IConfiguration configuration,
            ILogger logger)
        {
            var adminEmail = configuration["Admin:Email"] ?? "admin@thanya.com";
            var adminPassword = configuration["Admin:Password"];

            if (string.IsNullOrEmpty(adminPassword))
            {
                logger.LogWarning("Admin:Password configuration is missing. Skipping administrator account seeding.");
                return;
            }

            var adminUser = await userManager.FindByEmailAsync(adminEmail);

            if (adminUser == null)
            {
                var adminRole = await roleManager.FindByNameAsync("Admin");
                var newAdmin = new User
                {
                    UserName = "admin",
                    Email = adminEmail,
                    EmailConfirmed = true,
                    FirstName = "System",
                    LastName = "Admin",
                    Address = "Alexandria",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    RoleId = adminRole?.Id ?? 1
                };

                var result = await userManager.CreateAsync(newAdmin, adminPassword);
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(newAdmin, "Admin");
                }
                else
                {
                    logger.LogWarning("Failed to seed admin user: {Errors}", string.Join(", ", System.Linq.Enumerable.Select(result.Errors, e => e.Description)));
                }
            }
        }

        public static async Task SeedLookupDataAsync(AppDbContext context)
        {
            // Seed OrderStatuses
            if (!await context.OrderStatuses.AnyAsync())
            {
                context.OrderStatuses.AddRange(
                    new OrderStatus { StatusName = "Pending" },
                    new OrderStatus { StatusName = "Processing" },
                    new OrderStatus { StatusName = "Shipped" },
                    new OrderStatus { StatusName = "Delivered" },
                    new OrderStatus { StatusName = "Cancelled" }
                );
            }

            // Seed PaymentMethods
            if (!await context.PaymentMethods.AnyAsync())
            {
                context.PaymentMethods.AddRange(
                    new PaymentMethod { MethodName = "Stripe", IsActive = true },
                    new PaymentMethod { MethodName = "Credit Card", IsActive = true },
                    new PaymentMethod { MethodName = "Cash on Delivery", IsActive = true }
                );
            }

            await context.SaveChangesAsync();

            // Seed Categories
            var categories = new List<Category>();
            var catNames = new[] { "Engine Parts", "Brakes", "Suspension", "Electrical", "Filters" };
            var catDescs = new[] {
                "Pistons, gaskets, valves, and full block components.",
                "Rotors, calipers, pads, and hydraulic sensors.",
                "Struts, control arms, shocks, and bushings.",
                "Alternators, starters, batteries, and wiring.",
                "Oil filters, cabin air filters, and intake filters."
            };

            for (int i = 0; i < catNames.Length; i++)
            {
                var name = catNames[i];
                var cat = await context.Categories.FirstOrDefaultAsync(c => c.CategoryName == name);
                if (cat == null)
                {
                    cat = new Category { CategoryName = name, Description = catDescs[i], ImageUrl = "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=400&q=80" };
                    context.Categories.Add(cat);
                    await context.SaveChangesAsync();
                }
                categories.Add(cat);
            }

            var pistonsRings = await context.Categories.FirstOrDefaultAsync(c => c.CategoryName == "Pistons & Rings");
            if (pistonsRings == null)
            {
                var engineParts = await context.Categories.FirstOrDefaultAsync(c => c.CategoryName == "Engine Parts");
                pistonsRings = new Category { CategoryName = "Pistons & Rings", Description = "Internal cylinder engine components.", ParentCategoryId = engineParts?.CategoryId, ImageUrl = "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=400&q=80" };
                context.Categories.Add(pistonsRings);
            }

            var brakePads = await context.Categories.FirstOrDefaultAsync(c => c.CategoryName == "Brake Pads");
            if (brakePads == null)
            {
                var brakes = await context.Categories.FirstOrDefaultAsync(c => c.CategoryName == "Brakes");
                brakePads = new Category { CategoryName = "Brake Pads", Description = "Ceramic and semi-metallic friction pads.", ParentCategoryId = brakes?.CategoryId, ImageUrl = "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=400&q=80" };
                context.Categories.Add(brakePads);
            }
            await context.SaveChangesAsync();

            // Seed Suppliers
            var suppliers = new[]
            {
                new Supplier { SupplierName = "Bosch Automotive", ContactPerson = "Sarah Jenkins", Email = "s.jenkins@bosch.com", Phone = "+1-800-267-2401", TaxNumber = "TX-908123-B", Address = "1200 Block Ave, Chicago, IL", IsActive = true },
                new Supplier { SupplierName = "Brembo S.p.A.", ContactPerson = "Luca Rossi", Email = "l.rossi@brembo.it", Phone = "+39-035-605-111", TaxNumber = "IT-002145-R", Address = "Viale Europa 2, Stezzano, Italy", IsActive = true },
                new Supplier { SupplierName = "Denso Corp", ContactPerson = "Kenji Sato", Email = "k.sato@denso.co.jp", Phone = "+81-566-25-5511", TaxNumber = "JP-987102-D", Address = "1-1 Showa-cho, Kariya, Aichi, Japan", IsActive = true },
                new Supplier { SupplierName = "ACDelco", ContactPerson = "Mike Davis", Email = "m.davis@acdelco.com", Phone = "+1-800-223-3526", TaxNumber = "TX-551239-A", Address = "Grand Blanc, Michigan, USA", IsActive = true }
            };

            foreach (var sup in suppliers)
            {
                var existingSup = await context.Suppliers.FirstOrDefaultAsync(s => s.SupplierName == sup.SupplierName);
                if (existingSup == null)
                {
                    context.Suppliers.Add(sup);
                    await context.SaveChangesAsync();
                }
            }

            // Seed Products
            var catElectrical = await context.Categories.FirstOrDefaultAsync(c => c.CategoryName == "Electrical");
            var catBrakePads = await context.Categories.FirstOrDefaultAsync(c => c.CategoryName == "Brake Pads");
            var catEngineParts = await context.Categories.FirstOrDefaultAsync(c => c.CategoryName == "Engine Parts");

            var supBosch = await context.Suppliers.FirstOrDefaultAsync(s => s.SupplierName == "Bosch Automotive");
            var supBrembo = await context.Suppliers.FirstOrDefaultAsync(s => s.SupplierName == "Brembo S.p.A.");
            var supDenso = await context.Suppliers.FirstOrDefaultAsync(s => s.SupplierName == "Denso Corp");

            if (catElectrical != null && supBosch != null)
            {
                var prod = await context.Products.FirstOrDefaultAsync(p => p.SKU == "SP-BOSCH-PL10");
                if (prod == null)
                {
                    context.Products.Add(new Product
                    {
                        ProductName = "Bosch Double Platinum Spark Plug",
                        SKU = "SP-BOSCH-PL10",
                        PartNumber = "FR7DPP33",
                        Description = "Engineered for performance and longer service life. Laser welded platinum inlay provides superior ignitability.",
                        UnitPrice = 12.99m,
                        CostPrice = 6.50m,
                        CategoryId = catElectrical.CategoryId,
                        SupplierId = supBosch.SupplierId,
                        ImageUrl = "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=400&q=80",
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    });
                }
            }

            if (catBrakePads != null && supBrembo != null)
            {
                var prod = await context.Products.FirstOrDefaultAsync(p => p.SKU == "BR-BREMBO-F20");
                if (prod == null)
                {
                    context.Products.Add(new Product
                    {
                        ProductName = "Brembo Sport Brake Rotor (Front Pair)",
                        SKU = "BR-BREMBO-F20",
                        PartNumber = "09.C306.11",
                        Description = "High-carbon ventilated brake disc pair. Zinc plated to prevent rust. Direct replacement for OEM rotors.",
                        UnitPrice = 249.50m,
                        CostPrice = 130.00m,
                        CategoryId = catBrakePads.CategoryId,
                        SupplierId = supBrembo.SupplierId,
                        ImageUrl = "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=400&q=80",
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    });
                }
            }

            if (catEngineParts != null && supDenso != null)
            {
                var prod = await context.Products.FirstOrDefaultAsync(p => p.SKU == "FI-DENSO-X99");
                if (prod == null)
                {
                    context.Products.Add(new Product
                    {
                        ProductName = "Denso Fuel Injector Assembly",
                        SKU = "FI-DENSO-X99",
                        PartNumber = "23250-0H050",
                        Description = "Genuine OEM performance fuel injector. Provides optimized fuel atomization for maximum efficiency.",
                        UnitPrice = 89.99m,
                        CostPrice = 40.00m,
                        CategoryId = catEngineParts.CategoryId,
                        SupplierId = supDenso.SupplierId,
                        ImageUrl = "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=400&q=80",
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    });
                }
            }
            await context.SaveChangesAsync();

            // Seed Warehouses
            var warehouses = new[]
            {
                new Warehouse { WarehouseName = "Central Logistics Hub", Location = "Industrial Zone A, Cairo", IsActive = true },
                new Warehouse { WarehouseName = "North Delta Warehouse", Location = "Alexandria Road, Tanta", IsActive = true }
            };

            foreach (var wh in warehouses)
            {
                var existingWh = await context.Warehouses.FirstOrDefaultAsync(w => w.WarehouseName == wh.WarehouseName);
                if (existingWh == null)
                {
                    context.Warehouses.Add(wh);
                    await context.SaveChangesAsync();
                }
            }

            // Seed Inventory for seeded products
            var prod1 = await context.Products.FirstOrDefaultAsync(p => p.SKU == "SP-BOSCH-PL10");
            var prod2 = await context.Products.FirstOrDefaultAsync(p => p.SKU == "BR-BREMBO-F20");
            var prod3 = await context.Products.FirstOrDefaultAsync(p => p.SKU == "FI-DENSO-X99");
            var defaultWh = await context.Warehouses.FirstOrDefaultAsync();

            if (defaultWh != null)
            {
                if (prod1 != null && !await context.Inventories.AnyAsync(i => i.ProductId == prod1.ProductId))
                {
                    context.Inventories.Add(new Inventory { ProductId = prod1.ProductId, WarehouseId = defaultWh.WarehouseId, QuantityInStock = 150, ReorderLevel = 10 });
                }
                if (prod2 != null && !await context.Inventories.AnyAsync(i => i.ProductId == prod2.ProductId))
                {
                    context.Inventories.Add(new Inventory { ProductId = prod2.ProductId, WarehouseId = defaultWh.WarehouseId, QuantityInStock = 75, ReorderLevel = 5 });
                }
                if (prod3 != null && !await context.Inventories.AnyAsync(i => i.ProductId == prod3.ProductId))
                {
                    context.Inventories.Add(new Inventory { ProductId = prod3.ProductId, WarehouseId = defaultWh.WarehouseId, QuantityInStock = 100, ReorderLevel = 8 });
                }
                await context.SaveChangesAsync();
            }

            // Seed CarBrands
            if (!await context.CarBrands.AnyAsync())
            {
                context.CarBrands.AddRange(
                    new CarBrand { BrandName = "Toyota", Country = "Japan" },
                    new CarBrand { BrandName = "BMW", Country = "Germany" },
                    new CarBrand { BrandName = "Honda", Country = "Japan" },
                    new CarBrand { BrandName = "Ford", Country = "USA" }
                );
                await context.SaveChangesAsync();
            }

            // Seed CarModels
            if (!await context.CarModels.AnyAsync())
            {
                var brandToyota = await context.CarBrands.FirstOrDefaultAsync(b => b.BrandName == "Toyota");
                var brandBmw = await context.CarBrands.FirstOrDefaultAsync(b => b.BrandName == "BMW");
                var brandHonda = await context.CarBrands.FirstOrDefaultAsync(b => b.BrandName == "Honda");

                if (brandToyota != null)
                {
                    context.CarModels.AddRange(
                        new CarModel { BrandId = brandToyota.BrandId, ModelName = "Corolla", YearStart = 2012, YearEnd = 2018, EngineType = "1.8L 4-Cylinder" },
                        new CarModel { BrandId = brandToyota.BrandId, ModelName = "Camry", YearStart = 2015, YearEnd = 2021, EngineType = "2.5L 4-Cylinder" }
                    );
                }
                if (brandBmw != null)
                {
                    context.CarModels.Add(new CarModel { BrandId = brandBmw.BrandId, ModelName = "3 Series (F30)", YearStart = 2012, YearEnd = 2019, EngineType = "2.0L TwinTurbo" });
                }
                if (brandHonda != null)
                {
                    context.CarModels.Add(new CarModel { BrandId = brandHonda.BrandId, ModelName = "Civic", YearStart = 2016, YearEnd = 2022, EngineType = "1.5L Turbo" });
                }
                await context.SaveChangesAsync();
            }

            // Seed PartCompatibilities
            if (!await context.PartCompatibilities.AnyAsync())
            {
                var pcProd1 = await context.Products.FirstOrDefaultAsync(p => p.SKU == "SP-BOSCH-PL10");
                var pcProd2 = await context.Products.FirstOrDefaultAsync(p => p.SKU == "BR-BREMBO-F20");
                var modelCorolla = await context.CarModels.FirstOrDefaultAsync(m => m.ModelName == "Corolla");
                var model3Series = await context.CarModels.FirstOrDefaultAsync(m => m.ModelName == "3 Series (F30)");

                if (pcProd1 != null && modelCorolla != null)
                {
                    context.PartCompatibilities.Add(new PartCompatibility { ProductId = pcProd1.ProductId, ModelId = modelCorolla.ModelId, Notes = "Fits 1.8L engines only." });
                }
                if (pcProd2 != null && model3Series != null)
                {
                    context.PartCompatibilities.Add(new PartCompatibility { ProductId = pcProd2.ProductId, ModelId = model3Series.ModelId, Notes = "Requires M-Sport braking kit." });
                }
                await context.SaveChangesAsync();
            }
        }
    }
}
