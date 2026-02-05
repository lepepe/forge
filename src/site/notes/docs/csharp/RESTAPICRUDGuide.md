---
{"dg-publish":true,"permalink":"/docs/csharp/restapicrud-guide/","tags":["csharp","REST","API","entity_framwork"]}
---

# Building a C# REST API with SQL Server — Step-by-Step CRUD Guide

This guide walks you through building a simple **Products** CRUD API using **ASP.NET Core**, **Entity Framework Core**, and **SQL Server**.

---

## 1. Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download) installed
- [SQL Server](https://www.microsoft.com/en-us/sql/sql-server/sql-server-downloads) (Developer or Express edition)
- [SQL Server Management Studio (SSMS)](https://learn.microsoft.com/en-us/sql/ssms/download-sql-server-management-studio-ssms) (optional, for manual DB inspection)
- A terminal or IDE like **Visual Studio** or **VS Code**

---

## 2. Create the Project

Open your terminal and run:

```bash
dotnet new webapi -n ProductApi --force
cd ProductApi
```

This scaffolds a new ASP.NET Core Web API project. Open it in your IDE or editor.

Can also use the `--use-controllers` flag:
```bash

dotnet new webapi --use-controllers
```

This generates the traditional structure with a Controllers folder and a WeatherForecastController.cs instead of inline MapGet() calls.

---

## 3. Install NuGet Packages

You need two packages: the SQL Server provider for EF Core, and the EF Core tools for migrations.

```bash
dotnet add package Microsoft.EntityFrameworkCore.SqlServer
dotnet add package Microsoft.EntityFrameworkCore.Tools
```

---

## 4. Configure the Connection String

Open **`appsettings.json`** and add your SQL Server connection string:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=ProductApiDb;Trusted_Connection=true;TrustServerCertificate=true;"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

> **Note:** If you're using SQL Server authentication instead of Windows auth, replace `Trusted_Connection=true` with `User Id=YourUser;Password=YourPassword;`.

---

## 5. Create the Model

Models represent your database tables. Create a folder called **`Models`** and add a file **`Product.cs`**:

```csharp
// Models/Product.cs
namespace ProductApi.Models;

public class Product
{
    public int Id { get; set; }           // Primary key (auto-incremented by EF)
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Quantity { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
```

This single class will map directly to a `Products` table in SQL Server.

---

## 6. Create the DbContext

The `DbContext` is EF Core's bridge between your C# models and the database. Create a folder called **`Data`** and add **`ProductDbContext.cs`**:

```csharp
// Data/ProductDbContext.cs
using Microsoft.EntityFrameworkCore;
using ProductApi.Models;

namespace ProductApi.Data;

public class ProductDbContext : DbContext
{
    public ProductDbContext(DbContextOptions<ProductDbContext> options) : base(options)
    {
    }

    // Each DbSet<T> maps to a table
    public DbSet<Product> Products => Set<Product>();
}
```

---

## 7. Register the DbContext in Program.cs

Open **`Program.cs`** and wire up EF Core. Your file should look something like this:

```csharp
// Program.cs
using ProductApi.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Register EF Core with SQL Server
builder.Services.AddDbContext<ProductDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.MapControllers();

app.Run();
```

---

## 8. Create the Controller

Controllers handle HTTP requests and expose your API endpoints. Create a folder called **`Controllers`** and add **`ProductsController.cs`**:

```csharp
// Controllers/ProductsController.cs
using Microsoft.AspNetCore.Mvc;
using ProductApi.Data;
using ProductApi.Models;
using Microsoft.EntityFrameworkCore;

namespace ProductApi.Controllers;

[Route("api/[controller]")]   // Base route: /api/Products
[ApiController]
public class ProductsController : ControllerBase
{
    private readonly ProductDbContext _context;

    public ProductsController(ProductDbContext context)
    {
        _context = context;     // Injected automatically by ASP.NET Core DI
    }

    // ─── READ (All) ───────────────────────────────────────────
    // GET /api/Products
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
    {
        return await _context.Products.ToListAsync();
    }

    // ─── READ (Single) ────────────────────────────────────────
    // GET /api/Products/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<Product>> GetProduct(int id)
    {
        var product = await _context.Products.FindAsync(id);

        if (product is null)
            return NotFound();

        return product;
    }

    // ─── CREATE ───────────────────────────────────────────────
    // POST /api/Products
    [HttpPost]
    public async Task<ActionResult<Product>> CreateProduct(Product product)
    {
        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        // Returns 201 Created with the new resource and its Location header
        return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
    }

    // ─── UPDATE ───────────────────────────────────────────────
    // PUT /api/Products/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProduct(int id, Product product)
    {
        if (id != product.Id)
            return BadRequest("ID in URL does not match ID in body.");

        // Tell EF Core this entity is being modified
        _context.Entry(product).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            // If the entity no longer exists, return 404
            if (!await _context.Products.AnyAsync(p => p.Id == id))
                return NotFound();

            throw; // Otherwise re-throw — something else went wrong
        }

        return NoContent(); // 204 success, no body
    }

    // ─── DELETE ───────────────────────────────────────────────
    // DELETE /api/Products/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var product = await _context.Products.FindAsync(id);

        if (product is null)
            return NotFound();

        _context.Products.Remove(product);
        await _context.SaveChangesAsync();

        return NoContent(); // 204 success
    }
}
```

---

## 9. Run Migrations & Create the Database

EF Core can automatically generate your SQL Server database and tables from your models.

**Create the migration** (this generates the SQL instructions):

```bash
dotnet ef migrations add InitialCreate
```

**Apply the migration** (this executes the SQL against your database):

```bash
dotnet ef database update
```

A new database called `ProductApiDb` will be created on your SQL Server instance with a `Products` table.

---

## 10. Run and Test

Start the API:

```bash
dotnet run
```

By default it runs on `https://localhost:8081`. The Swagger UI will open automatically at:

```
https://localhost:8081/swagger
```

### Quick test with `curl`

```bash
# Create a product
curl -X POST https://localhost:8081/api/Products \
  -H "Content-Type: application/json" \
  -d '{"name":"Widget","description":"A shiny widget","price":9.99,"quantity":100}'

# Get all products
curl https://localhost:8081/api/Products

# Get a single product (replace 1 with your ID)
curl https://localhost:8081/api/Products/1

# Update a product
curl -X PUT https://localhost:8081/api/Products/1 \
  -H "Content-Type: application/json" \
  -d '{"id":1,"name":"Super Widget","description":"An even shinier widget","price":14.99,"quantity":50}'

# Delete a product
curl -X DELETE https://localhost:8081/api/Products/1
```

---

## Project Structure (Final)

```
ProductApi/
├── Controllers/
│   └── ProductsController.cs
├── Data/
│   └── ProductDbContext.cs
├── Models/
│   └── Product.cs
├── Migrations/          ← auto-generated by EF Core
├── Program.cs
├── appsettings.json
└── ProductApi.csproj
```

---

## What's Next (Optional Enhancements)

- **DTOs (Data Transfer Objects):** Separate your API request/response shapes from your database models to avoid exposing internal fields.
- **Validation:** Add `[Required]`, `[Range]`, etc. attributes to your model or DTO properties.
- **Async repository pattern:** Abstract the database layer behind an interface for easier testing.
- **Authentication:** Add Bearer token or cookie-based auth via ASP.NET Core Identity.
- **Pagination:** Add `skip`/`take` query parameters to your GET endpoints for large datasets.
