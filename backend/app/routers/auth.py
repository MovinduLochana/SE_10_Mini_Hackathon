from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, EmailStr
from app.core.supabase_client import get_supabase
from app.core.auth import get_current_user, AuthenticatedUser

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

class AuthCredentials(BaseModel):
    email: EmailStr
    password: str

class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str

@router.post("/signup", response_model=AuthTokenResponse, status_code=status.HTTP_201_CREATED)
async def signup(credentials: AuthCredentials):
    """
    Registers a new merchant user via Supabase Auth and returns an access token.
    """
    try:
        supabase = get_supabase()
        res = supabase.auth.sign_up({
            "email": credentials.email,
            "password": credentials.password
        })
        if not res.user:
            raise HTTPException(status_code=400, detail="Could not create user account.")
        
        session = res.session
        access_token = session.access_token if session else ""
        return AuthTokenResponse(
            access_token=access_token,
            user_id=str(res.user.id),
            email=str(res.user.email)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Signup failed: {str(e)}")

@router.post("/login", response_model=AuthTokenResponse)
async def login(credentials: AuthCredentials):
    """
    Authenticates a merchant user via Supabase Auth and returns an access token.
    """
    try:
        supabase = get_supabase()
        res = supabase.auth.sign_in_with_password({
            "email": credentials.email,
            "password": credentials.password
        })
        if not res.session or not res.user:
            raise HTTPException(status_code=401, detail="Invalid email or password.")
        
        return AuthTokenResponse(
            access_token=res.session.access_token,
            user_id=str(res.user.id),
            email=str(res.user.email)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Login failed: {str(e)}")

@router.get("/me")
async def get_me(current_user: AuthenticatedUser = Depends(get_current_user)):
    """
    Returns the currently authenticated merchant user profile.
    """
    return {
        "user_id": current_user.id,
        "email": current_user.email,
        "metadata": current_user.metadata
    }
