"""
Tests for user registration and authentication endpoints.
"""
from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
import json


class RegisterViewTest(TestCase):
    """Test cases for user registration endpoint."""
    
    def setUp(self):
        """Set up test client."""
        self.client = APIClient()
        self.register_url = '/api/auth/register'
        self.valid_data = {
            'email': 'test@example.com',
            'password': 'SecurePassword123!'
        }
    
    def tearDown(self):
        """Clean up test data."""
        User.objects.all().delete()
    
    def test_successful_registration(self):
        """Test successful user registration with valid data."""
        response = self.client.post(
            self.register_url,
            data=json.dumps(self.valid_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('message', response.data)
        self.assertEqual(response.data['message'], 'User registered successfully')
        self.assertIn('data', response.data)
        self.assertIn('id', response.data['data'])
        self.assertIn('email', response.data['data'])
        self.assertIn('tokens', response.data['data'])
        self.assertIn('access', response.data['data']['tokens'])
        self.assertIn('refresh', response.data['data']['tokens'])
        
        # Verify user was created in database
        self.assertTrue(User.objects.filter(email='test@example.com').exists())
        
        # Verify password was hashed (not stored as plaintext)
        user = User.objects.get(email='test@example.com')
        self.assertNotEqual(user.password, 'SecurePassword123!')
        self.assertTrue(user.check_password('SecurePassword123!'))
    
    def test_duplicate_email_registration(self):
        """Test registration with already registered email."""
        # Create first user
        User.objects.create_user(
            username='test@example.com',
            email='test@example.com',
            password='Password123!'
        )
        
        # Try to register with same email
        response = self.client.post(
            self.register_url,
            data=json.dumps(self.valid_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('message', response.data)
        self.assertEqual(response.data['message'], 'Email already registered')
    
    def test_invalid_email_format(self):
        """Test registration with invalid email format."""
        invalid_emails = [
            'notanemail',
            'missing@domain',
            '@example.com',
            'user@',
            'user @example.com',
            'user@example',
        ]
        
        for invalid_email in invalid_emails:
            response = self.client.post(
                self.register_url,
                data=json.dumps({
                    'email': invalid_email,
                    'password': 'SecurePassword123!'
                }),
                content_type='application/json'
            )
            
            self.assertEqual(
                response.status_code, 
                status.HTTP_400_BAD_REQUEST,
                f"Failed for email: {invalid_email}"
            )
            self.assertIn('message', response.data)
            self.assertEqual(response.data['message'], 'Invalid email format')
    
    def test_missing_email(self):
        """Test registration without email."""
        response = self.client.post(
            self.register_url,
            data=json.dumps({'password': 'SecurePassword123!'}),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('message', response.data)
        self.assertEqual(response.data['message'], 'Email is required')
    
    def test_missing_password(self):
        """Test registration without password."""
        response = self.client.post(
            self.register_url,
            data=json.dumps({'email': 'test@example.com'}),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('message', response.data)
        self.assertEqual(response.data['message'], 'Password is required')
    
    def test_weak_password_too_short(self):
        """Test registration with password that's too short."""
        response = self.client.post(
            self.register_url,
            data=json.dumps({
                'email': 'test@example.com',
                'password': 'Short1!'
            }),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('message', response.data)
        self.assertEqual(response.data['message'], 'Password validation failed')
        self.assertIn('data', response.data)
        self.assertIn('errors', response.data['data'])
    
    def test_weak_password_common(self):
        """Test registration with common password."""
        response = self.client.post(
            self.register_url,
            data=json.dumps({
                'email': 'test@example.com',
                'password': 'password123'
            }),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('message', response.data)
        self.assertEqual(response.data['message'], 'Password validation failed')
    
    def test_weak_password_numeric_only(self):
        """Test registration with numeric-only password."""
        response = self.client.post(
            self.register_url,
            data=json.dumps({
                'email': 'test@example.com',
                'password': '12345678901234'
            }),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('message', response.data)
        self.assertEqual(response.data['message'], 'Password validation failed')
    
    def test_email_case_insensitive(self):
        """Test that email is stored in lowercase."""
        response = self.client.post(
            self.register_url,
            data=json.dumps({
                'email': 'Test@EXAMPLE.COM',
                'password': 'SecurePassword123!'
            }),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(id=response.data['data']['id'])
        self.assertEqual(user.email, 'test@example.com')
        self.assertEqual(user.username, 'test@example.com')
    
    def test_password_is_hashed(self):
        """Test that password is properly hashed in database."""
        response = self.client.post(
            self.register_url,
            data=json.dumps(self.valid_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Get user from database
        user = User.objects.get(email='test@example.com')
        
        # Password should not be stored as plaintext
        self.assertNotEqual(user.password, 'SecurePassword123!')
        
        # Password should start with hashing algorithm identifier
        self.assertTrue(user.password.startswith('pbkdf2_sha256$'))
        
        # Should be able to verify password
        self.assertTrue(user.check_password('SecurePassword123!'))
        self.assertFalse(user.check_password('WrongPassword'))


class LoginViewTest(TestCase):
    """Test cases for user login endpoint."""
    
    def setUp(self):
        """Set up test client and test user."""
        self.client = APIClient()
        self.login_url = '/api/auth/login'
        self.test_email = 'test@example.com'
        self.test_password = 'SecurePassword123!'
        
        # Create test user
        self.user = User.objects.create_user(
            username=self.test_email,
            email=self.test_email,
            password=self.test_password
        )
    
    def tearDown(self):
        """Clean up test data."""
        User.objects.all().delete()
    
    def test_successful_login(self):
        """Test successful login with valid credentials."""
        response = self.client.post(
            self.login_url,
            data=json.dumps({
                'email': self.test_email,
                'password': self.test_password
            }),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)
        self.assertEqual(response.data['message'], 'Login successful')
        self.assertIn('data', response.data)
        self.assertIn('id', response.data['data'])
        self.assertIn('email', response.data['data'])
        self.assertIn('tokens', response.data['data'])
        self.assertIn('access', response.data['data']['tokens'])
        self.assertIn('refresh', response.data['data']['tokens'])
    
    def test_invalid_password(self):
        """Test login with incorrect password."""
        response = self.client.post(
            self.login_url,
            data=json.dumps({
                'email': self.test_email,
                'password': 'WrongPassword123!'
            }),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('message', response.data)
        self.assertEqual(response.data['message'], 'Invalid email or password')
    
    def test_nonexistent_user(self):
        """Test login with non-existent email."""
        response = self.client.post(
            self.login_url,
            data=json.dumps({
                'email': 'nonexistent@example.com',
                'password': 'Password123!'
            }),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('message', response.data)
        self.assertEqual(response.data['message'], 'Invalid email or password')
    
    def test_missing_email(self):
        """Test login without email."""
        response = self.client.post(
            self.login_url,
            data=json.dumps({'password': self.test_password}),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('message', response.data)
        self.assertEqual(response.data['message'], 'Email and password are required')
    
    def test_missing_password(self):
        """Test login without password."""
        response = self.client.post(
            self.login_url,
            data=json.dumps({'email': self.test_email}),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('message', response.data)
        self.assertEqual(response.data['message'], 'Email and password are required')
    
    def test_case_insensitive_email_login(self):
        """Test login with different email case."""
        response = self.client.post(
            self.login_url,
            data=json.dumps({
                'email': 'TEST@EXAMPLE.COM',
                'password': self.test_password
            }),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], 'Login successful')
    
    def test_inactive_user_login(self):
        """Test login with inactive user account."""
        # Deactivate user account
        self.user.is_active = False
        self.user.save()
        
        response = self.client.post(
            self.login_url,
            data=json.dumps({
                'email': self.test_email,
                'password': self.test_password
            }),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('message', response.data)
        self.assertEqual(response.data['message'], 'Account is inactive. Please contact support.')
    
    def test_jwt_tokens_are_valid(self):
        """Test that JWT tokens returned are valid and contain correct user info."""
        response = self.client.post(
            self.login_url,
            data=json.dumps({
                'email': self.test_email,
                'password': self.test_password
            }),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify tokens are present and non-empty
        access_token = response.data['data']['tokens']['access']
        refresh_token = response.data['data']['tokens']['refresh']
        
        self.assertIsNotNone(access_token)
        self.assertIsNotNone(refresh_token)
        self.assertTrue(len(access_token) > 0)
        self.assertTrue(len(refresh_token) > 0)
        
        # Verify we can decode the access token
        from rest_framework_simplejwt.tokens import AccessToken
        token = AccessToken(access_token)
        self.assertEqual(token['user_id'], self.user.id)
