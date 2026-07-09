# Project Overview

carSparePartSys Car Spare Part System is a dedicated web and API-driven platform built to handle the transactional and operational needs of car spare parts distributors. The system acts as a bridges connecting stock managers, parts suppliers, and auto repair shops (or individual customers) who need to find, verify, and buy exact automotive components.

## What the Project Is

At its core, carSparePartSys is an e-commerce catalog combined with a multi-warehouse inventory tracker and a vehicle compatibility engine. It exposes a RESTful API powered by ASP.NET Core and a lightweight, responsive Web UI. It organizes thousands of individual parts, matching them to specific vehicle profiles (brands, model revisions, production periods) to eliminate the risk of mismatching parts.

## Why it was Built

Automotive parts sales suffer from high return rates due to incorrect orders. A filter for a "2015 Toyota Corolla" might return three different variations of a brake pad depending on whether it has a 1.8L engine or is an M-Sport package. Standard e-commerce platforms do not have the database schema or filters necessary to represent these complex compatibility mappings. 

carSparePartSys was built to enforce compatibility checks directly at the database and API levels, helping customers locate the correct components without relying on manual catalog reading.

## Target Audience

1. **Customers / Workshops**: Mechanics and car owners who need to query parts matching their vehicle specs, add them to a wishlist/cart, and complete payments securely.
2. **Warehouse/Stock Operators**: Logistics staff who need to track inventory levels across regional warehouses, update units, and receive reorder alerts.
3. **Suppliers**: Parts manufacturers or primary distributors who supply parts and need invoices generated for their listings.
4. **System Administrators**: Administrators who manage catalog categories, approve product listings, monitor order processing, and review customer returns.

## Real-Life Scenario

Consider a local auto repair garage. A mechanic has a BMW 3-Series (F30) in their bay that requires a replacement front pair of sport brake rotors. 
Using the carSparePartSys portal, the mechanic selects:
- Brand: `BMW`
- Model: `3 Series (F30)`

The system filters the catalog and returns the exact matching part: the `Brembo Sport Brake Rotor (Front Pair)`, SKU `BR-BREMBO-F20`. The system explicitly informs them of notes like "Requires M-Sport braking kit." The mechanic places the order, pays instantly through Stripe, and the central warehouse automatically updates its stock level, printing a delivery note.

## Project Development Story

The project began when a local spare parts consortium struggled with a high rate of inventory returns—nearly 22% of orders were sent back because parts did not fit the buyers' vehicles. Standard commercial e-commerce systems lacked the capability to handle multi-warehouse inventory levels mapped to vehicle-specific compatibility logs. 

To resolve this, the development team built carSparePartSys using Clean Architecture to isolate database operations from client-side visual presentations. This design allowed the team to enforce strict compatibility rules, integrate secure Stripe payments, and offer real-time stock updates across multiple distribution nodes.
