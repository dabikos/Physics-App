#!/usr/bin/env python3
"""
Additional Backend API Tests - Edge Cases and Error Handling
"""

import requests
import json

BACKEND_URL = "https://physedu-2.preview.emergentagent.com/api"

def test_invalid_endpoints():
    """Test invalid endpoints return proper errors"""
    print("🔍 Testing Error Handling:")
    
    # Test invalid task ID
    try:
        response = requests.get(f"{BACKEND_URL}/tasks/invalid-task-id", timeout=10)
        if response.status_code == 404:
            print("✅ PASS Invalid task ID returns 404")
        else:
            print(f"❌ FAIL Invalid task ID returned {response.status_code}")
    except Exception as e:
        print(f"❌ FAIL Invalid task test failed: {e}")
    
    # Test invalid test ID
    try:
        response = requests.get(f"{BACKEND_URL}/tests/invalid-test-id", timeout=10)
        if response.status_code == 404:
            print("✅ PASS Invalid test ID returns 404")
        else:
            print(f"❌ FAIL Invalid test ID returned {response.status_code}")
    except Exception as e:
        print(f"❌ FAIL Invalid test test failed: {e}")
    
    # Test protected endpoint without auth
    try:
        response = requests.post(f"{BACKEND_URL}/chat", 
                               json={"message": "test"}, 
                               headers={"Content-Type": "application/json"},
                               timeout=10)
        if response.status_code == 403 or response.status_code == 401:
            print("✅ PASS Protected endpoint requires auth")
        else:
            print(f"❌ FAIL Protected endpoint returned {response.status_code}")
    except Exception as e:
        print(f"❌ FAIL Protected endpoint test failed: {e}")

def test_data_validation():
    """Test data validation"""
    print("\n📋 Testing Data Validation:")
    
    # Test invalid registration data
    try:
        invalid_data = {"email": "invalid-email", "password": "123", "name": ""}
        response = requests.post(f"{BACKEND_URL}/auth/register", 
                               json=invalid_data,
                               headers={"Content-Type": "application/json"},
                               timeout=10)
        if response.status_code == 422 or response.status_code == 400:
            print("✅ PASS Invalid registration data rejected")
        else:
            print(f"❌ FAIL Invalid registration returned {response.status_code}")
    except Exception as e:
        print(f"❌ FAIL Registration validation test failed: {e}")

def test_specific_endpoints():
    """Test specific endpoint functionality"""
    print("\n🎯 Testing Specific Endpoints:")
    
    # Test specific section
    try:
        response = requests.get(f"{BACKEND_URL}/sections/mechanics", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "name" in data and data["name"] == "Механика":
                print("✅ PASS Specific section endpoint works")
            else:
                print("❌ FAIL Specific section data incorrect")
        else:
            print(f"❌ FAIL Specific section returned {response.status_code}")
    except Exception as e:
        print(f"❌ FAIL Specific section test failed: {e}")
    
    # Test specific task
    try:
        response = requests.get(f"{BACKEND_URL}/tasks/task-mech-1", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "question" in data and "options" in data:
                print("✅ PASS Specific task endpoint works")
            else:
                print("❌ FAIL Specific task data incorrect")
        else:
            print(f"❌ FAIL Specific task returned {response.status_code}")
    except Exception as e:
        print(f"❌ FAIL Specific task test failed: {e}")

if __name__ == "__main__":
    print("🧪 Additional Backend API Tests")
    print("=" * 50)
    
    test_invalid_endpoints()
    test_data_validation()
    test_specific_endpoints()
    
    print("\n✅ Additional tests completed")