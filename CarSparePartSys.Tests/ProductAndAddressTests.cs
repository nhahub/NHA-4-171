using CarSparePartSys.Model;
using CarSparePartSysProject.BL.Service;
using CarSparePartSysProject.DAL.Repositories.Interfaces;
using CarSparePartSysProject.Models.Dto.Addresses;
using CarSparePartSysProject.Models.Dto.Products.Inventory;
using FluentAssertions;
using Moq;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace CarSparePartSys.Tests
{
    public class ProductAndAddressTests
    {
        private readonly Mock<IAddressRepository> _addressRepositoryMock;
        private readonly AddressService _addressService;
        private readonly Mock<IInventoryRepository> _inventoryRepositoryMock;
        private readonly InventoryService _inventoryService;

        public ProductAndAddressTests()
        {
            _addressRepositoryMock = new Mock<IAddressRepository>();
            _addressService = new AddressService(_addressRepositoryMock.Object);

            _inventoryRepositoryMock = new Mock<IInventoryRepository>();
            _inventoryService = new InventoryService(_inventoryRepositoryMock.Object);
        }

        [Fact]
        public async Task Address_GetByIdAsync_ReturnsAddressDto()
        {
            // Arrange
            var addressId = 1;
            var address = new Address
            {
                AddressId = addressId,
                UserId = 10,
                FullName = "John Doe",
                Phone = "12345",
                Street = "123 Main St",
                City = "Cityville",
                Country = "USA",
                Type = AddressType.Billing
            };
            _addressRepositoryMock.Setup(r => r.GetByIdAsync(addressId)).ReturnsAsync(address);

            // Act
            var result = await _addressService.GetByIdAsync(addressId);

            // Assert
            result.Should().NotBeNull();
            result.AddressId.Should().Be(addressId);
            result.FullName.Should().Be("John Doe");
            result.Type.Should().Be("Billing");
        }

        [Fact]
        public async Task Address_CreateAsync_SavesAndReturnsDto()
        {
            // Arrange
            var dto = new CreateAddressRequestDto
            {
                UserId = 10,
                FullName = "Jane Doe",
                Phone = "54321",
                Street = "456 Side St",
                City = "Townsville",
                Country = "Canada",
                IsDefault = true,
                Type = "Shipping"
            };

            _addressRepositoryMock.Setup(r => r.AddAsync(It.IsAny<Address>())).Returns(Task.CompletedTask);
            _addressRepositoryMock.Setup(r => r.SaveAsync()).Returns(Task.CompletedTask);

            // Act
            var result = await _addressService.CreateAsync(dto);

            // Assert
            result.Should().NotBeNull();
            result.FullName.Should().Be("Jane Doe");
            result.Type.Should().Be("Shipping");
            _addressRepositoryMock.Verify(r => r.AddAsync(It.Is<Address>(a => a.FullName == "Jane Doe")), Times.Once);
            _addressRepositoryMock.Verify(r => r.SaveAsync(), Times.Once);
        }

        [Fact]
        public async Task Inventory_GetAllAsync_ReturnsInventoryItems()
        {
            // Arrange
            var items = new List<Inventory>
            {
                new Inventory { InventoryId = 1, ProductId = 100, QuantityInStock = 50, ReorderLevel = 10 },
                new Inventory { InventoryId = 2, ProductId = 101, QuantityInStock = 5, ReorderLevel = 10 }
            };
            _inventoryRepositoryMock.Setup(r => r.GetAllAsync()).ReturnsAsync(items);

            // Act
            var result = await _inventoryService.GetAllAsync();

            // Assert
            result.Should().NotBeNull();
            result.Count().Should().Be(2);
            result.First().QuantityInStock.Should().Be(50);
        }

        [Fact]
        public async Task Inventory_UpdateStockAsync_ModifiesFirstItem()
        {
            // Arrange
            var items = new List<Inventory>
            {
                new Inventory { InventoryId = 1, ProductId = 100, QuantityInStock = 50, ReorderLevel = 10 }
            };
            _inventoryRepositoryMock.Setup(r => r.GetAllAsync()).ReturnsAsync(items);
            _inventoryRepositoryMock.Setup(r => r.Update(It.IsAny<Inventory>()));
            _inventoryRepositoryMock.Setup(r => r.SaveAsync()).Returns(Task.CompletedTask);

            var updateDto = new UpdateInventoryRequestDto { QuantityInStock = 60, ReorderLevel = 15 };

            // Act
            await _inventoryService.UpdateStockAsync(updateDto);

            // Assert
            items[0].QuantityInStock.Should().Be(60);
            items[0].ReorderLevel.Should().Be(15);
            _inventoryRepositoryMock.Verify(r => r.Update(items[0]), Times.Once);
            _inventoryRepositoryMock.Verify(r => r.SaveAsync(), Times.Once);
        }
    }
}
