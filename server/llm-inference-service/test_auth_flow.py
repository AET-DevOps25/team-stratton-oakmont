#!/usr/bin/env python3
"""
Test script to verify the authentication flow between frontend, LLM service, and Study Plan service
"""
import asyncio
import httpx
from data_service_client import data_service

async def test_auth_flow():
    print("🧪 Testing authentication flow...")
    
    # Test 1: Direct call to our data service client (simulating LLM service)
    print("\n1. Testing data service client with Bearer token:")
    result = await data_service.get_user_study_plan("7", "fake-test-token-123")
    print(f"Result: {result}")
    
    # Test 2: Direct HTTP call to LLM service (simulating frontend)
    print("\n2. Testing LLM service endpoint:")
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "http://localhost:8084/chat/",
            headers={
                "Content-Type": "application/json",
                "Authorization": "Bearer fake-test-token-123"
            },
            json={
                "message": "Tell me about machine learning courses for my study program",
                "study_plan_id": "7"
            },
            timeout=30.0
        )
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {data['response'][:200]}...")
            print(f"Module IDs: {data['module_ids']}")
        else:
            print(f"Error: {response.text}")

if __name__ == "__main__":
    asyncio.run(test_auth_flow())
