---
{"dg-publish":true,"permalink":"/docs/python/polars/sql-server-connection/","tags":["polars","sql-server","database","connection","odbc"]}
---

# Connecting to SQL Server

## Overview

Polars can connect to SQL Server databases using ODBC drivers or through SQLAlchemy. This guide covers setting up connections for reading and writing data in ETL pipelines.

---

## Prerequisites

### Install Required Packages

```bash
pip install polars pyodbc sqlalchemy
```

### Install ODBC Driver

**Ubuntu/Debian:**
```bash
curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add -
curl https://packages.microsoft.com/config/ubuntu/$(lsb_release -rs)/prod.list > /etc/apt/sources.list.d/mssql-release.list
apt-get update
ACCEPT_EULA=Y apt-get install -y msodbcsql18
```

**macOS:**
```bash
brew install microsoft/mssql-release/msodbcsql18
```

**Windows:**
Download from [Microsoft ODBC Driver for SQL Server](https://learn.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server)

---

## Connection String Formats

### Basic ODBC Connection String

```python
conn_str = (
    "Driver={ODBC Driver 18 for SQL Server};"
    "Server=your_server.database.windows.net;"
    "Database=your_database;"
    "UID=your_username;"
    "PWD=your_password;"
    "Encrypt=yes;"
    "TrustServerCertificate=no;"
)
```

### Windows Authentication

```python
conn_str = (
    "Driver={ODBC Driver 18 for SQL Server};"
    "Server=your_server;"
    "Database=your_database;"
    "Trusted_Connection=yes;"
)
```

### SQLAlchemy Connection URI

```python
# Using pyodbc
uri = "mssql+pyodbc://user:password@server/database?driver=ODBC+Driver+18+for+SQL+Server"

# With Windows Authentication
uri = "mssql+pyodbc://server/database?driver=ODBC+Driver+18+for+SQL+Server&trusted_connection=yes"
```

---

## Reading Data from SQL Server

### Using Polars read_database

```python
import polars as pl

conn_str = (
    "Driver={ODBC Driver 18 for SQL Server};"
    "Server=localhost;"
    "Database=AdventureWorks;"
    "UID=sa;"
    "PWD=YourPassword123;"
)

# Read entire table
df = pl.read_database(
    query="SELECT * FROM Sales.Customer",
    connection=conn_str
)

# Read with parameterized query
df = pl.read_database(
    query="SELECT * FROM Sales.Customer WHERE TerritoryID = ?",
    connection=conn_str,
    execute_options={"parameters": [1]}
)
```

### Using Connection URI

```python
import polars as pl

uri = "mssql+pyodbc://sa:YourPassword123@localhost/AdventureWorks?driver=ODBC+Driver+18+for+SQL+Server"

df = pl.read_database_uri(
    query="SELECT * FROM Sales.Customer",
    uri=uri
)
```

### Lazy Reading (Recommended for Large Datasets)

```python
import polars as pl

# Creates a LazyFrame - query executes on .collect()
lf = pl.scan_database(
    query="SELECT * FROM Sales.SalesOrderHeader WHERE OrderDate >= '2024-01-01'",
    connection=conn_str
)

# Apply transformations before collecting
result = (
    lf
    .filter(pl.col("TotalDue") > 1000)
    .select(["SalesOrderID", "CustomerID", "TotalDue"])
    .collect()
)
```

---

## Connection Helper Class

A reusable connection manager for ETL pipelines:

```python
import polars as pl
from dataclasses import dataclass
from typing import Optional


@dataclass
class SQLServerConfig:
    server: str
    database: str
    username: Optional[str] = None
    password: Optional[str] = None
    driver: str = "ODBC Driver 18 for SQL Server"
    trusted_connection: bool = False
    encrypt: bool = True
    trust_server_certificate: bool = False

    def get_connection_string(self) -> str:
        parts = [
            f"Driver={{{self.driver}}}",
            f"Server={self.server}",
            f"Database={self.database}",
        ]

        if self.trusted_connection:
            parts.append("Trusted_Connection=yes")
        else:
            parts.append(f"UID={self.username}")
            parts.append(f"PWD={self.password}")

        if self.encrypt:
            parts.append("Encrypt=yes")

        if self.trust_server_certificate:
            parts.append("TrustServerCertificate=yes")

        return ";".join(parts)

    def get_uri(self) -> str:
        driver_encoded = self.driver.replace(" ", "+")
        if self.trusted_connection:
            return f"mssql+pyodbc://{self.server}/{self.database}?driver={driver_encoded}&trusted_connection=yes"
        return f"mssql+pyodbc://{self.username}:{self.password}@{self.server}/{self.database}?driver={driver_encoded}"


# Usage
config = SQLServerConfig(
    server="localhost",
    database="AdventureWorks",
    username="sa",
    password="YourPassword123"
)

df = pl.read_database(
    query="SELECT * FROM Sales.Customer",
    connection=config.get_connection_string()
)
```

---

## Environment Variables for Security

Never hardcode credentials. Use environment variables:

```python
import os
import polars as pl

config = SQLServerConfig(
    server=os.environ["SQL_SERVER"],
    database=os.environ["SQL_DATABASE"],
    username=os.environ["SQL_USERNAME"],
    password=os.environ["SQL_PASSWORD"]
)
```

### Airflow Connections

In Airflow, use the built-in connection management:

```python
from airflow.hooks.base import BaseHook

def get_connection_string(conn_id: str) -> str:
    conn = BaseHook.get_connection(conn_id)
    return (
        f"Driver={{ODBC Driver 18 for SQL Server}};"
        f"Server={conn.host};"
        f"Database={conn.schema};"
        f"UID={conn.login};"
        f"PWD={conn.password};"
    )
```

---

## Connection Pooling

For high-throughput ETL, use connection pooling with SQLAlchemy:

```python
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool
import polars as pl

engine = create_engine(
    "mssql+pyodbc://user:pass@server/db?driver=ODBC+Driver+18+for+SQL+Server",
    poolclass=QueuePool,
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True
)

# Use engine connection
with engine.connect() as conn:
    df = pl.read_database(
        query="SELECT * FROM Sales.Customer",
        connection=conn
    )
```

---

## Handling Connection Errors

```python
import polars as pl
from polars.exceptions import ComputeError
import pyodbc


def read_with_retry(query: str, conn_str: str, max_retries: int = 3) -> pl.DataFrame:
    for attempt in range(max_retries):
        try:
            return pl.read_database(query=query, connection=conn_str)
        except (ComputeError, pyodbc.Error) as e:
            if attempt == max_retries - 1:
                raise
            print(f"Connection attempt {attempt + 1} failed: {e}")
            time.sleep(2 ** attempt)  # Exponential backoff
```

---

## Testing Connection

```python
import polars as pl


def test_connection(conn_str: str) -> bool:
    try:
        df = pl.read_database(
            query="SELECT 1 as test",
            connection=conn_str
        )
        return df.shape == (1, 1)
    except Exception as e:
        print(f"Connection failed: {e}")
        return False


# Usage
if test_connection(config.get_connection_string()):
    print("Connection successful!")
```

---

## Key Takeaways

1. Use **ODBC Driver 18** for modern SQL Server connections
2. Store credentials in **environment variables** or Airflow connections
3. Use **`scan_database`** for lazy evaluation with large datasets
4. Implement **connection pooling** for high-throughput ETL
5. Add **retry logic** for production reliability
6. Use **parameterized queries** to prevent SQL injection

---

## Related Topics

- [[docs/python/polars/PolarsGuide\|Polars Guide]]
- [[docs/python/polars/SQLContext\|SQL Context Interface]]
- [[docs/python/polars/SelectingData\|Selecting and Reading Data]]
- [[docs/python/polars/AirflowETL\|ETL with Apache Airflow]]

---

## Sources

- [Polars read_database Documentation](https://docs.pola.rs/py-polars/html/reference/api/polars.read_database.html)
- [Microsoft ODBC Driver Documentation](https://learn.microsoft.com/en-us/sql/connect/odbc/microsoft-odbc-driver-for-sql-server)
- [PyODBC Documentation](https://github.com/mkleehammer/pyodbc/wiki)

---

#polars #python #sql-server #database #connection #odbc #etl
