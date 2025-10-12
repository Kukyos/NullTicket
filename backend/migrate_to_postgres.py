# PostgreSQL Migration Script
# Run this to migrate from SQLite to PostgreSQL

import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# SQLite connection
SQLITE_URL = "sqlite:///./data/tickets.db"

# PostgreSQL connection (update with your credentials)
POSTGRES_URL = os.getenv(
    "POSTGRES_URL",
    "postgresql://user:password@localhost:5432/nullticket"
)

def migrate():
    """Migrate data from SQLite to PostgreSQL"""
    print("🔄 Starting migration from SQLite to PostgreSQL...")
    
    # Create engines
    sqlite_engine = create_engine(SQLITE_URL)
    postgres_engine = create_engine(POSTGRES_URL)
    
    # Create sessions
    SQLiteSession = sessionmaker(bind=sqlite_engine)
    PostgresSession = sessionmaker(bind=postgres_engine)
    
    sqlite_session = SQLiteSession()
    postgres_session = PostgresSession()
    
    try:
        # Get table names from SQLite
        result = sqlite_session.execute(text(
            "SELECT name FROM sqlite_master WHERE type='table'"
        ))
        tables = [row[0] for row in result if row[0] != 'sqlite_sequence']
        
        print(f"📋 Found {len(tables)} tables to migrate")
        
        # Create tables in PostgreSQL using SQLAlchemy models
        from app.models.ticket_models import Base
        Base.metadata.create_all(postgres_engine)
        print("✅ Tables created in PostgreSQL")
        
        # Migrate data for each table
        for table in tables:
            print(f"📦 Migrating table: {table}")
            
            # Get all rows from SQLite
            rows = sqlite_session.execute(text(f"SELECT * FROM {table}")).fetchall()
            
            if not rows:
                print(f"  ℹ️  {table} is empty, skipping")
                continue
            
            # Get column names
            columns = sqlite_session.execute(text(f"PRAGMA table_info({table})")).fetchall()
            column_names = [col[1] for col in columns]
            
            # Insert into PostgreSQL
            for row in rows:
                placeholders = ", ".join([f":{col}" for col in column_names])
                insert_sql = f"INSERT INTO {table} ({', '.join(column_names)}) VALUES ({placeholders})"
                
                row_dict = dict(zip(column_names, row))
                postgres_session.execute(text(insert_sql), row_dict)
            
            postgres_session.commit()
            print(f"  ✅ Migrated {len(rows)} rows")
        
        print("🎉 Migration completed successfully!")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        postgres_session.rollback()
        sys.exit(1)
    finally:
        sqlite_session.close()
        postgres_session.close()

if __name__ == "__main__":
    print("""
╔═══════════════════════════════════════╗
║   NullTicket Database Migration       ║
║   SQLite → PostgreSQL                 ║
╚═══════════════════════════════════════╝
    """)
    
    print("⚠️  WARNING: This will migrate all data to PostgreSQL")
    print(f"   Source: {SQLITE_URL}")
    print(f"   Target: {POSTGRES_URL}")
    print()
    
    confirm = input("Continue? (yes/no): ")
    if confirm.lower() == 'yes':
        migrate()
    else:
        print("❌ Migration cancelled")
