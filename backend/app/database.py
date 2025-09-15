import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from google.cloud.sql.connector import Connector

def get_database_url():
    # Use Cloud SQL Connector for better reliability
    instance_connection_name = "luantra-production:us-central1:luantra-db"
    db_user = "luantra_user"
    db_pass = "luantra_secure_2024"
    db_name = "luantra"
    
    # For Cloud Run, use the connector
    if os.getenv("ENVIRONMENT") == "production":
        connector = Connector()
        
        def getconn():
            conn = connector.connect(
                instance_connection_name,
                "pg8000",
                user=db_user,
                password=db_pass,
                db=db_name
            )
            return conn
        
        return create_engine(
            "postgresql+pg8000://",
            creator=getconn,
        )
    else:
        # Local development fallback
        return create_engine(f"postgresql://{db_user}:{db_pass}@34.45.208.83:5432/{db_name}")

engine = get_database_url()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
