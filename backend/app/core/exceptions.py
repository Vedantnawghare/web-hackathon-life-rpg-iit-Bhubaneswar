from typing import Any, Dict, Optional
from fastapi import Request, status
from fastapi.responses import JSONResponse


class DomainException(Exception):
    """Base exception for all domain-level Life RPG errors."""

    def __init__(
        self,
        detail: str,
        code: str = "DOMAIN_ERROR",
        status_code: int = status.HTTP_400_BAD_REQUEST,
        extra: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(detail)
        self.detail = detail
        self.code = code
        self.status_code = status_code
        self.extra = extra or {}


class EntityNotFoundException(DomainException):
    def __init__(self, detail: str = "Requested resource not found.", code: str = "NOT_FOUND"):
        super().__init__(detail=detail, code=code, status_code=status.HTTP_404_NOT_FOUND)


class ConflictException(DomainException):
    def __init__(self, detail: str = "Resource conflict detected.", code: str = "CONFLICT"):
        super().__init__(detail=detail, code=code, status_code=status.HTTP_409_CONFLICT)


class UnauthorizedException(DomainException):
    def __init__(self, detail: str = "Authentication required.", code: str = "UNAUTHORIZED"):
        super().__init__(detail=detail, code=code, status_code=status.HTTP_401_UNAUTHORIZED)


class ForbiddenException(DomainException):
    def __init__(self, detail: str = "Access forbidden.", code: str = "FORBIDDEN"):
        super().__init__(detail=detail, code=code, status_code=status.HTTP_403_FORBIDDEN)


class InsufficientGoldException(DomainException):
    def __init__(self, detail: str = "Insufficient gold to purchase item.", code: str = "INSUFFICIENT_GOLD"):
        super().__init__(detail=detail, code=code, status_code=status.HTTP_400_BAD_REQUEST)


class BadRequestException(DomainException):
    def __init__(self, detail: str = "Invalid request.", code: str = "BAD_REQUEST"):
        super().__init__(detail=detail, code=code, status_code=status.HTTP_400_BAD_REQUEST)


async def domain_exception_handler(request: Request, exc: DomainException) -> JSONResponse:
    """RFC 7807 problem details error response handler."""
    content = {
        "type": f"https://liferpg.app/errors/{exc.code.lower().replace('_', '-')}",
        "title": exc.code.replace("_", " ").title(),
        "status": exc.status_code,
        "detail": exc.detail,
        "code": exc.code,
        **exc.extra,
    }
    return JSONResponse(status_code=exc.status_code, content=content)
