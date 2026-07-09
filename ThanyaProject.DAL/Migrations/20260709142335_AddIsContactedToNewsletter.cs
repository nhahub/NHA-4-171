using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CarSparePartSysProject.DAL.Migrations
{
    /// <inheritdoc />
    public partial class AddIsContactedToNewsletter : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF NOT EXISTS (
                    SELECT 1 
                    FROM sys.columns 
                    WHERE object_id = OBJECT_ID(N'[dbo].[NewsletterSubscriptions]') 
                    AND name = N'IsContacted'
                )
                BEGIN
                    ALTER TABLE [NewsletterSubscriptions] ADD [IsContacted] bit NOT NULL DEFAULT CAST(0 AS bit);
                END
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF EXISTS (
                    SELECT 1 
                    FROM sys.columns 
                    WHERE object_id = OBJECT_ID(N'[dbo].[NewsletterSubscriptions]') 
                    AND name = N'IsContacted'
                )
                BEGIN
                    ALTER TABLE [NewsletterSubscriptions] DROP COLUMN [IsContacted];
                END
            ");
        }
    }
}
