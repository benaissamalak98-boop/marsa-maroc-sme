from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from ..schemas import UserLogin, TokenResponse, UserResponse
from ..auth import verify_password, create_access_token, get_current_user
from ..audit import log_action

router = APIRouter(prefix="/api/auth", tags=["Authentification"])

@router.post("/login", response_model=TokenResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Authentification utilisateur et émission du jeton JWT."""
    user = db.query(User).filter(User.username == credentials.username).first()
    if not user or not verify_password(credentials.password, user.hashed_password, user.salt):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nom d'utilisateur ou mot de passe incorrect."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Ce compte utilisateur est désactivé."
        )

    access_token = create_access_token(data={"sub": user.username, "role": user.role})

    # Log d'audit
    log_action(
        db,
        username=user.username,
        action="LOGIN",
        entity="USER",
        entity_id=user.id,
        user_id=user.id
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    """Récupère le profil de l'utilisateur actuellement connecté."""
    return current_user
