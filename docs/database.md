# Database Schema

The database for the Thanya Car Spare Part System is built on Microsoft SQL Server and managed using Entity Framework Core. The schema is highly relational, enforcing integrity across products, compatibility mappings, inventory levels, order pipelines, and billing details.

---

## 1. Schema Constraints & Decimal Precision

To ensure financial accuracy, the database enforces a `(18,2)` precision rule on all financial fields:

| Table | Properties | Precision |
| :--- | :--- | :--- |
| `Products` | `UnitPrice`, `CostPrice` | `18,2` |
| `Orders` | `SubTotal`, `TaxAmount`, `DiscountAmount`, `TotalAmount` | `18,2` |
| `OrderDetails` | `UnitPrice`, `Discount`, `LineTotal` | `18,2` |
| `Invoices` | `SubTotal`, `TaxAmount`, `TotalAmount`, `TaxRate` | `18,2` |
| `Payments` | `Amount` | `18,2` |
| `Shippings` | `ShippingCost` | `18,2` |
| `Coupons` | `DiscountValue`, `MinOrderAmount`, `MaxDiscountAmount` | `18,2` |
| `ReturnRequests` | `RefundAmount` | `18,2` |

### Check Constraints
- **Review Rating**: The `Reviews` table contains a SQL check constraint, `CK_Review_Rating`, restricting rating values:
  `[Rating] BETWEEN 1 AND 5`

---

## 2. Indexes & Unique Constraints

Unique indexes are declared in `AppDbContext.OnModelCreating` to enforce business rules and optimize query search speeds:

1. **`Products.SKU`**: Enforces unique part SKU identifiers.
2. **`Orders.OrderNumber`**: Ensures no duplicate order tracking codes exist.
3. **`Invoices.InvoiceNumber`**: Enforces billing identifier integrity.
4. **`Coupons.Code`**: Restricts discount codes from duplicating.
5. **`Cart.UserId`**: Restricts users to a single active cart.
6. **`Shipping.OrderId`**: Restricts each order to one shipping dispatch record.
7. **Composite Unique Indexes**:
   - `Inventory` (`ProductId`, `WarehouseId`): Prevents multiple stock listings for the same part at one warehouse.
   - `Wishlist` (`UserId`, `ProductId`): Prevents saving the same item multiple times.
   - `Review` (`UserId`, `ProductId`): Restricts users to one review per product.
   - `CartItem` (`CartId`, `ProductId`): Ensures items are consolidated under a single quantity line per cart.
   - `PartCompatibility` (`ProductId`, `ModelId`): Prevents redundant compatibility mappings.

---

## 3. Relationships & Cascade Delete Actions

### One-to-One Relationships
- **`Cart` <-> `User`**: Linked via `Cart.UserId` as a foreign key.
- **`Invoice` <-> `Order`**: Linked via `Invoice.OrderId` as a foreign key.
- **`Shipping` <-> `Order`**: Linked via `Shipping.OrderId` as a foreign key.

### Restricted Deletions (`DeleteBehavior.Restrict`)
To prevent accidental loss of transaction history or reference configurations, the following foreign key mappings block cascade deletions:
- **`User` -> `Role`**: Cannot delete a role if users are still assigned to it.
- **`Address` -> `User`**: Cannot delete a user if shipping addresses exist.
- **`Category` -> `ParentCategory`**: Cannot delete a parent category if subcategories are nested under it.
- **`Order` -> `Customer` / `Processor`**: Restricts deletion of user accounts if order logs link to them.
- **`ReturnRequest` -> `User` / `Processor`**: Restricts deletion of account profiles if return logs reference them.
- **`StockTransaction` -> `User`**: Restricts deletion of staff members who performed warehouse stock actions.
