from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid


db = SQLAlchemy()


# ======================================================
# USERS
# ======================================================

class User(db.Model):

    __tablename__ = "users"

    id = db.Column(
        db.UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    email = db.Column(
        db.String,
        unique=True,
        nullable=False
    )

    name = db.Column(
        db.String,
        nullable=True
    )

    company = db.Column(
        db.String,
        nullable=True
    )

    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow
    )


    # Relaciones

    credit_account = db.relationship(
        "CreditAccount",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan"
    )

    credit_transactions = db.relationship(
        "CreditTransaction",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    reports = db.relationship(
        "Report",
        back_populates="user",
        cascade="all, delete-orphan"
    )


# ======================================================
# CREDIT ACCOUNTS
# ======================================================

class CreditAccount(db.Model):

    __tablename__ = "credit_accounts"


    id = db.Column(
        db.UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )


    user_id = db.Column(
        db.UUID(as_uuid=True),
        db.ForeignKey(
            "users.id",
            ondelete="CASCADE"
        ),
        unique=True,
        nullable=False
    )


    balance = db.Column(
        db.Integer,
        nullable=False,
        default=0
    )


    updated_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )


    # Relación

    user = db.relationship(
        "User",
        back_populates="credit_account"
    )


# ======================================================
# CREDIT TRANSACTIONS
# ======================================================

class CreditTransaction(db.Model):

    __tablename__ = "credit_transactions"


    id = db.Column(
        db.UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )


    user_id = db.Column(
        db.UUID(as_uuid=True),
        db.ForeignKey(
            "users.id",
            ondelete="CASCADE"
        ),
        nullable=False
    )


    type = db.Column(
        db.String,
        nullable=False
    )


    amount = db.Column(
        db.Integer,
        nullable=False
    )


    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow
    )


    # Relación

    user = db.relationship(
        "User",
        back_populates="credit_transactions"
    )


# ======================================================
# REPORTS
# ======================================================

class Report(db.Model):

    __tablename__ = "reports"


    id = db.Column(
        db.UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )


    user_id = db.Column(
        db.UUID(as_uuid=True),
        db.ForeignKey(
            "users.id",
            ondelete="CASCADE"
        ),
        nullable=False
    )


    report_type = db.Column(
        db.String,
        nullable=True
    )


    filename = db.Column(
        db.String,
        nullable=True
    )


    anlagenname = db.Column(
        db.String,
        nullable=True
    )


    kwp = db.Column(
        db.Numeric,
        nullable=True
    )


    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow
    )


    # Relación

    user = db.relationship(
        "User",
        back_populates="reports"
    )