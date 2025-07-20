#!/usr/bin/env python3

import json
import requests
import time
import sys
import os

def wait_for_weaviate(url, max_attempts=30):
    """Wait for Weaviate to be ready"""
    print("⏳ Waiting for Weaviate to be ready...")
    for i in range(max_attempts):
        try:
            response = requests.get(f"{url}/v1/meta", timeout=5)
            if response.status_code == 200:
                print("✅ Weaviate is ready")
                return True
        except requests.exceptions.RequestException:
            pass
        print(f"   Attempt {i+1}/{max_attempts}: Waiting for Weaviate...")
        time.sleep(10)
    return False

def import_schema(url, schema_file):
    """Import Weaviate schema"""
    print("📋 Importing schema...")
    try:
        with open(schema_file, 'r') as f:
            schema = json.load(f)
        
        response = requests.post(f"{url}/v1/schema", json=schema, timeout=30)
        if response.status_code in [200, 422]:  # 422 means schema already exists
            print("✅ Schema imported successfully")
            return True
        else:
            print(f"⚠️  Schema import failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Schema import error: {e}")
        return False

def import_objects(url, data_file, batch_size=10):
    """Import objects in batches"""
    print("📥 Importing objects...")
    try:
        with open(data_file, 'r') as f:
            data = json.load(f)
        
        objects = data.get('objects', [])
        total_objects = len(objects)
        print(f"📊 Found {total_objects} objects to import")
        
        imported = 0
        failed = 0
        
        # Import in batches using batch endpoint
        for i in range(0, total_objects, batch_size):
            batch = objects[i:i+batch_size]
            batch_data = {"objects": batch}
            
            try:
                response = requests.post(f"{url}/v1/batch/objects", json=batch_data, timeout=60)
                if response.status_code == 200:
                    batch_result = response.json()
                    batch_imported = sum(1 for obj in batch_result if not obj.get('result', {}).get('errors'))
                    imported += batch_imported
                    failed += len(batch) - batch_imported
                else:
                    print(f"   ⚠️  Batch {i//batch_size + 1} failed: {response.status_code}")
                    failed += len(batch)
                
                if (i // batch_size + 1) % 5 == 0:
                    print(f"   Progress: {imported}/{total_objects} imported, {failed} failed")
                    
            except Exception as e:
                print(f"   ⚠️  Batch {i//batch_size + 1} error: {e}")
                failed += len(batch)
        
        print(f"✅ Import completed: {imported} successful, {failed} failed")
        return imported > 0
        
    except Exception as e:
        print(f"❌ Objects import error: {e}")
        return False

def verify_import(url):
    """Verify the import by counting objects"""
    print("🔍 Verifying import...")
    try:
        response = requests.get(f"{url}/v1/objects?class=TUMCourse&limit=1", timeout=10)
        if response.status_code == 200:
            data = response.json()
            count = data.get('totalResults', 0)
            print(f"✅ Total objects in Weaviate: {count}")
            return count > 0
        else:
            print(f"⚠️  Verification failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Verification error: {e}")
        return False

def main():
    print("📥 Importing Weaviate Data (Python)")
    print("===================================")
    
    # Configuration
    weaviate_url = "http://localhost:8000"
    export_dir = "/opt/tum-study-planner/weaviate-export"
    
    # If running locally (for testing)
    if os.path.exists("./weaviate-export"):
        export_dir = "./weaviate-export"
    
    print(f"📁 Using export directory: {export_dir}")
    
    schema_file = os.path.join(export_dir, "schema.json")
    data_file = os.path.join(export_dir, "TUMCourse_data.json")
    
    # Check if files exist
    if not os.path.exists(schema_file):
        print(f"❌ Schema file not found: {schema_file}")
        sys.exit(1)
    
    if not os.path.exists(data_file):
        print(f"❌ Data file not found: {data_file}")
        sys.exit(1)
    
    print("✅ Export files found")
    
    # Wait for Weaviate
    if not wait_for_weaviate(weaviate_url):
        print("❌ Cannot connect to Weaviate")
        sys.exit(1)
    
    # Import schema
    if not import_schema(weaviate_url, schema_file):
        print("❌ Schema import failed")
        sys.exit(1)
    
    # Import objects
    if not import_objects(weaviate_url, data_file):
        print("❌ Objects import failed")
        sys.exit(1)
    
    # Verify import
    if not verify_import(weaviate_url):
        print("❌ Import verification failed")
        sys.exit(1)
    
    print("")
    print("🎉 Weaviate data import completed successfully!")

if __name__ == "__main__":
    main()
