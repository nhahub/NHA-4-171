using CarSparePartSys.Model;
using CarSparePartSysProject.BL.IServices;
using CarSparePartSysProject.DAL.Repositories.Interfaces;
using CarSparePartSysProject.Models.Dto.Addresses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CarSparePartSysProject.BL.Service
{
    public class AddressService : IAddressService
    {
        private readonly IAddressRepository _addressRepository;

        public AddressService(IAddressRepository addressRepository)
        {
            _addressRepository = addressRepository;
        }

        public async Task<IEnumerable<AddressDto>> GetUserAddressesAsync(int userId)
        {
            var addresses = await _addressRepository.GetAddressesByUserIdAsync(userId);
            return addresses.Select(a => new AddressDto
            {
                AddressId = a.AddressId,
                UserId = a.UserId,
                FullName = a.FullName,
                Phone = a.Phone,
                Street = a.Street,
                City = a.City,
                State = a.State ?? string.Empty,
                PostalCode = a.PostalCode ?? string.Empty,
                Country = a.Country,
                IsDefault = a.IsDefault,
                Type = a.Type.ToString()
            });
        }

        public async Task<AddressDto?> GetByIdAsync(int id)
        {
            var a = await _addressRepository.GetByIdAsync(id);
            if (a == null) return null;
            return new AddressDto
            {
                AddressId = a.AddressId,
                UserId = a.UserId,
                FullName = a.FullName,
                Phone = a.Phone,
                Street = a.Street,
                City = a.City,
                State = a.State ?? string.Empty,
                PostalCode = a.PostalCode ?? string.Empty,
                Country = a.Country,
                IsDefault = a.IsDefault,
                Type = a.Type.ToString()
            };
        }

        public async Task<AddressDto> CreateAsync(CreateAddressRequestDto dto)
        {
            var a = new Address
            {
                UserId = dto.UserId,
                FullName = dto.FullName,
                Phone = dto.Phone,
                Street = dto.Street,
                City = dto.City,
                State = dto.State,
                PostalCode = dto.PostalCode,
                Country = dto.Country,
                IsDefault = dto.IsDefault,
                Type = dto.Type == "Billing" ? AddressType.Billing : AddressType.Shipping,
                CreatedAt = DateTime.UtcNow
            };

            await _addressRepository.AddAsync(a);
            await _addressRepository.SaveAsync();

            return new AddressDto
            {
                AddressId = a.AddressId,
                UserId = a.UserId,
                FullName = a.FullName,
                Phone = a.Phone,
                Street = a.Street,
                City = a.City,
                State = a.State ?? string.Empty,
                PostalCode = a.PostalCode ?? string.Empty,
                Country = a.Country,
                IsDefault = a.IsDefault,
                Type = a.Type.ToString()
            };
        }

        public async Task<AddressDto> UpdateAsync(int id, UpdateAddressRequestDto dto)
        {
            var a = await _addressRepository.GetByIdAsync(id);
            if (a == null)
            {
                throw new KeyNotFoundException("Address not found.");
            }

            a.FullName = dto.FullName ?? a.FullName;
            a.Phone = dto.Phone ?? a.Phone;
            a.Street = dto.Street ?? a.Street;
            a.City = dto.City ?? a.City;
            a.State = dto.State ?? a.State;
            a.PostalCode = dto.PostalCode ?? a.PostalCode;
            a.Country = dto.Country ?? a.Country;
            a.IsDefault = dto.IsDefault ?? a.IsDefault;

            _addressRepository.Update(a);
            await _addressRepository.SaveAsync();

            return new AddressDto
            {
                AddressId = a.AddressId,
                UserId = a.UserId,
                FullName = a.FullName,
                Phone = a.Phone,
                Street = a.Street,
                City = a.City,
                State = a.State ?? string.Empty,
                PostalCode = a.PostalCode ?? string.Empty,
                Country = a.Country,
                IsDefault = a.IsDefault,
                Type = a.Type.ToString()
            };
        }

        public async Task DeleteAsync(int id)
        {
            var a = await _addressRepository.GetByIdAsync(id);
            if (a != null)
            {
                _addressRepository.Delete(a);
                await _addressRepository.SaveAsync();
            }
        }
    }
}
