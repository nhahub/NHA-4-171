using Microsoft.AspNetCore.Identity;
using System;
using System.Threading.Tasks;
using CarSparePartSys.Model;
using Microsoft.Extensions.Logging;

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
    }
}
