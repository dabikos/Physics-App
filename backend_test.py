#!/usr/bin/env python3
"""
Physics AI Backend API Testing Suite
Tests all backend endpoints for the Physics AI Learning App
"""

import requests
import json
import time
import sys
from typing import Dict, Any, Optional

# Backend URL from frontend .env
BACKEND_URL = "https://physedu-2.preview.emergentagent.com/api"

class PhysicsAPITester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.auth_token = None
        self.user_data = {
            "email": "test@physics.com",
            "password": "test123", 
            "name": "Test User"
        }
        self.test_results = []
        
    def log_result(self, test_name: str, success: bool, details: str = ""):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        result = f"{status} {test_name}"
        if details:
            result += f" - {details}"
        print(result)
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details
        })
        
    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, 
                    headers: Optional[Dict] = None, use_auth: bool = False) -> requests.Response:
        """Make HTTP request with proper error handling"""
        url = f"{self.base_url}{endpoint}"
        
        request_headers = {"Content-Type": "application/json"}
        if headers:
            request_headers.update(headers)
            
        if use_auth and self.auth_token:
            request_headers["Authorization"] = f"Bearer {self.auth_token}"
            
        try:
            if method.upper() == "GET":
                response = requests.get(url, headers=request_headers, timeout=30)
            elif method.upper() == "POST":
                response = requests.post(url, json=data, headers=request_headers, timeout=30)
            else:
                raise ValueError(f"Unsupported method: {method}")
                
            return response
        except requests.exceptions.RequestException as e:
            print(f"Request failed for {endpoint}: {e}")
            raise
            
    def test_auth_register(self):
        """Test user registration"""
        try:
            response = self.make_request("POST", "/auth/register", self.user_data)
            
            if response.status_code == 201 or response.status_code == 200:
                data = response.json()
                if "access_token" in data and "user" in data:
                    self.auth_token = data["access_token"]
                    self.log_result("Auth Register", True, f"User registered: {data['user']['name']}")
                    return True
                else:
                    self.log_result("Auth Register", False, "Missing token or user in response")
                    return False
            elif response.status_code == 400 and "уже зарегистрирован" in response.text:
                # User already exists, try login instead
                self.log_result("Auth Register", True, "User already exists (expected)")
                return self.test_auth_login()
            else:
                self.log_result("Auth Register", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Auth Register", False, f"Exception: {str(e)}")
            return False
            
    def test_auth_login(self):
        """Test user login"""
        try:
            login_data = {
                "email": self.user_data["email"],
                "password": self.user_data["password"]
            }
            response = self.make_request("POST", "/auth/login", login_data)
            
            if response.status_code == 200:
                data = response.json()
                if "access_token" in data and "user" in data:
                    self.auth_token = data["access_token"]
                    self.log_result("Auth Login", True, f"Login successful: {data['user']['name']}")
                    return True
                else:
                    self.log_result("Auth Login", False, "Missing token or user in response")
                    return False
            else:
                self.log_result("Auth Login", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Auth Login", False, f"Exception: {str(e)}")
            return False
            
    def test_sections_api(self):
        """Test physics sections API"""
        try:
            response = self.make_request("GET", "/sections")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, dict) and len(data) > 0:
                    sections = list(data.keys())
                    self.log_result("Sections API", True, f"Found {len(sections)} sections: {', '.join(sections[:3])}")
                    return True
                else:
                    self.log_result("Sections API", False, "Empty or invalid sections data")
                    return False
            else:
                self.log_result("Sections API", False, f"Status: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_result("Sections API", False, f"Exception: {str(e)}")
            return False
            
    def test_topics_api(self):
        """Test topics/lessons API"""
        try:
            # Test getting topics for mechanics section
            response = self.make_request("GET", "/topics?section=mechanics")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    self.log_result("Topics API", True, f"Found {len(data)} mechanics topics")
                    return True
                else:
                    self.log_result("Topics API", False, "No topics found for mechanics")
                    return False
            else:
                self.log_result("Topics API", False, f"Status: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_result("Topics API", False, f"Exception: {str(e)}")
            return False
            
    def test_tasks_api(self):
        """Test tasks API"""
        try:
            # Test getting tasks for mechanics section
            response = self.make_request("GET", "/tasks?section=mechanics")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    self.log_result("Tasks API", True, f"Found {len(data)} mechanics tasks")
                    return True
                else:
                    self.log_result("Tasks API", False, "No tasks found for mechanics")
                    return False
            else:
                self.log_result("Tasks API", False, f"Status: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_result("Tasks API", False, f"Exception: {str(e)}")
            return False
            
    def test_tests_api(self):
        """Test tests API"""
        try:
            # Test getting tests for mechanics section
            response = self.make_request("GET", "/tests?section=mechanics")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    self.log_result("Tests API", True, f"Found {len(data)} mechanics tests")
                    return True
                else:
                    self.log_result("Tests API", False, "No tests found for mechanics")
                    return False
            else:
                self.log_result("Tests API", False, f"Status: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_result("Tests API", False, f"Exception: {str(e)}")
            return False
            
    def test_formulas_api(self):
        """Test formulas API"""
        try:
            response = self.make_request("GET", "/formulas")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    self.log_result("Formulas API", True, f"Found {len(data)} formulas")
                    return True
                else:
                    self.log_result("Formulas API", False, "No formulas found")
                    return False
            else:
                self.log_result("Formulas API", False, f"Status: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_result("Formulas API", False, f"Exception: {str(e)}")
            return False
            
    def test_task_submission(self):
        """Test task answer submission (protected endpoint)"""
        if not self.auth_token:
            self.log_result("Task Submission", False, "No auth token available")
            return False
            
        try:
            # Submit answer to task-mech-1
            task_id = "task-mech-1"
            answer_data = {"answer": 1}  # Correct answer for the sample task
            
            response = self.make_request("POST", f"/tasks/{task_id}/submit", answer_data, use_auth=True)
            
            if response.status_code == 200:
                data = response.json()
                if "correct" in data and "explanation" in data:
                    self.log_result("Task Submission", True, f"Answer submitted, correct: {data['correct']}")
                    return True
                else:
                    self.log_result("Task Submission", False, "Missing response fields")
                    return False
            else:
                self.log_result("Task Submission", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Task Submission", False, f"Exception: {str(e)}")
            return False
            
    def test_test_submission(self):
        """Test test answers submission (protected endpoint)"""
        if not self.auth_token:
            self.log_result("Test Submission", False, "No auth token available")
            return False
            
        try:
            # Submit answers to test-mech-1
            test_id = "test-mech-1"
            answers_data = {"answers": [1, 1, 1, 1, 1]}  # Sample answers
            
            response = self.make_request("POST", f"/tests/{test_id}/submit", answers_data, use_auth=True)
            
            if response.status_code == 200:
                data = response.json()
                if "score" in data and "results" in data:
                    self.log_result("Test Submission", True, f"Test submitted, score: {data['score']}%")
                    return True
                else:
                    self.log_result("Test Submission", False, "Missing response fields")
                    return False
            else:
                self.log_result("Test Submission", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Test Submission", False, f"Exception: {str(e)}")
            return False
            
    def test_ai_chat(self):
        """Test AI chat API (protected endpoint)"""
        if not self.auth_token:
            self.log_result("AI Chat", False, "No auth token available")
            return False
            
        try:
            chat_data = {"message": "Что такое сила?"}
            
            response = self.make_request("POST", "/chat", chat_data, use_auth=True)
            
            if response.status_code == 200:
                data = response.json()
                if "response" in data and len(data["response"]) > 0:
                    self.log_result("AI Chat", True, f"Chat response received: {len(data['response'])} chars")
                    return True
                else:
                    self.log_result("AI Chat", False, "Empty or missing chat response")
                    return False
            else:
                self.log_result("AI Chat", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("AI Chat", False, f"Exception: {str(e)}")
            return False
            
    def test_progress_api(self):
        """Test progress tracking API (protected endpoint)"""
        if not self.auth_token:
            self.log_result("Progress API", False, "No auth token available")
            return False
            
        try:
            response = self.make_request("GET", "/progress", use_auth=True)
            
            if response.status_code == 200:
                data = response.json()
                if "overall_progress" in data and "lessons" in data and "tasks" in data:
                    self.log_result("Progress API", True, f"Progress: {data['overall_progress']}%")
                    return True
                else:
                    self.log_result("Progress API", False, "Missing progress fields")
                    return False
            else:
                self.log_result("Progress API", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Progress API", False, f"Exception: {str(e)}")
            return False
            
    def run_all_tests(self):
        """Run all backend API tests"""
        print(f"🧪 Starting Physics AI Backend API Tests")
        print(f"🔗 Backend URL: {self.base_url}")
        print("=" * 60)
        
        # Test authentication first
        print("\n📝 Authentication Tests:")
        auth_success = self.test_auth_register()
        if not auth_success:
            auth_success = self.test_auth_login()
            
        # Test public APIs
        print("\n🌐 Public API Tests:")
        self.test_sections_api()
        self.test_topics_api()
        self.test_tasks_api()
        self.test_tests_api()
        self.test_formulas_api()
        
        # Test protected APIs (only if auth successful)
        if auth_success:
            print("\n🔒 Protected API Tests:")
            self.test_task_submission()
            self.test_test_submission()
            self.test_ai_chat()
            self.test_progress_api()
        else:
            print("\n🔒 Skipping protected API tests (authentication failed)")
            
        # Summary
        print("\n" + "=" * 60)
        print("📊 Test Summary:")
        
        passed = sum(1 for r in self.test_results if r["success"])
        total = len(self.test_results)
        
        print(f"✅ Passed: {passed}/{total}")
        print(f"❌ Failed: {total - passed}/{total}")
        
        if total - passed > 0:
            print("\n🚨 Failed Tests:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"   • {result['test']}: {result['details']}")
                    
        return passed == total

if __name__ == "__main__":
    tester = PhysicsAPITester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)