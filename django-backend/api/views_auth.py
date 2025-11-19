"""
Authentication views for user registration and login.
"""
import logging
import re
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken

logger = logging.getLogger(__name__)


class RegisterView(APIView):
    """
    API endpoint for user registration.
    
    POST /api/auth/register
    Request body:
        {
            "email": "user@example.com",
            "password": "SecurePassword123!"
        }
    
    Response (success):
        {
            "message": "User registered successfully",
            "data": {
                "id": 1,
                "email": "user@example.com",
                "tokens": {
                    "access": "...",
                    "refresh": "..."
                }
            }
        }
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Handle user registration."""
        try:
            # Extract data
            email = request.data.get('email', '').strip().lower()
            password = request.data.get('password', '')
            
            # Validate email
            if not email:
                return Response(
                    {
                        "message": "Email is required",
                        "data": None
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validate email format
            email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            if not re.match(email_pattern, email):
                return Response(
                    {
                        "message": "Invalid email format",
                        "data": None
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if user already exists
            if User.objects.filter(username=email).exists():
                return Response(
                    {
                        "message": "Email already registered",
                        "data": None
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validate password
            if not password:
                return Response(
                    {
                        "message": "Password is required",
                        "data": None
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Use Django's password validators
            try:
                validate_password(password)
            except ValidationError as e:
                return Response(
                    {
                        "message": "Password validation failed",
                        "data": {"errors": list(e.messages)}
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create user (password is automatically hashed)
            user = User.objects.create_user(
                username=email,
                email=email,
                password=password
            )
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            logger.info(f"User registered successfully: {email}")
            
            return Response(
                {
                    "message": "User registered successfully",
                    "data": {
                        "id": user.id,
                        "email": user.email,
                        "tokens": {
                            "access": str(refresh.access_token),
                            "refresh": str(refresh)
                        }
                    }
                },
                status=status.HTTP_201_CREATED
            )
            
        except Exception as e:
            logger.error(f"Error during registration: {str(e)}")
            return Response(
                {
                    "message": "Registration failed",
                    "data": {"error": str(e)}
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class LoginView(APIView):
    """
    API endpoint for user login.
    
    POST /api/auth/login
    Request body:
        {
            "email": "user@example.com",
            "password": "SecurePassword123!"
        }
    
    Response (success):
        {
            "message": "Login successful",
            "data": {
                "id": 1,
                "email": "user@example.com",
                "tokens": {
                    "access": "...",
                    "refresh": "..."
                }
            }
        }
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Handle user login."""
        try:
            from django.contrib.auth import authenticate
            
            # Extract data
            email = request.data.get('email', '').strip().lower()
            password = request.data.get('password', '')
            
            # Validate input
            if not email or not password:
                return Response(
                    {
                        "message": "Email and password are required",
                        "data": None
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if user exists and is active before authentication
            try:
                user_obj = User.objects.get(username=email)
                if not user_obj.is_active:
                    return Response(
                        {
                            "message": "Account is inactive. Please contact support.",
                            "data": None
                        },
                        status=status.HTTP_403_FORBIDDEN
                    )
            except User.DoesNotExist:
                pass  # Will be handled by authenticate returning None
            
            # Authenticate user
            user = authenticate(username=email, password=password)
            
            if user is None:
                return Response(
                    {
                        "message": "Invalid email or password",
                        "data": None
                    },
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            logger.info(f"User logged in successfully: {email}")
            
            return Response(
                {
                    "message": "Login successful",
                    "data": {
                        "id": user.id,
                        "email": user.email,
                        "tokens": {
                            "access": str(refresh.access_token),
                            "refresh": str(refresh)
                        }
                    }
                },
                status=status.HTTP_200_OK
            )
            
        except Exception as e:
            logger.error(f"Error during login: {str(e)}")
            return Response(
                {
                    "message": "Login failed",
                    "data": {"error": str(e)}
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
