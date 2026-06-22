import sys
import os
import logging
import getpass
from argon2 import PasswordHasher

# Ensure the root of the AuthService is in sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.extensions.configurations import settings
from src.extensions import database_extension as db
from src.models.user import UserModel
from src.models.role import RoleModel
from src.enums.user_account_type_enum import UserAccountTypeEnum as AccountEnum

# Setup basic logging to stdout
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)
logger = logging.getLogger("create_superuser")

ph = PasswordHasher()

def create_superuser():
    print("\n--- Create Superuser (Interactive) ---")
    
    username = input("Enter username (default: admin): ").strip() or "admin"
    email = input("Enter email address (default: admin@example.com): ").strip() or "admin@example.com"
    
    while True:
        password = getpass.getpass("Password: ")
        if not password:
            print("❌ Password cannot be empty.")
            continue
        confirm_password = getpass.getpass("Password (again): ")
        if password != confirm_password:
            print("❌ Passwords do not match. Please try again.")
            continue
        break

    print("\n🚀 Initializing database connection...")
    logger.info("Initializing database connection...")
    db.init_db(settings.DATABASE_URL)
    
    if db.postgres_database is None:
        print("❌ Database connection initialization failed.")
        logger.error("Database connection initialization failed.")
        sys.exit(1)

    session = db.postgres_database.SessionLocal()
    try:
        # Check / Create ADMIN role
        print("🔍 Checking 'ADMIN' role in database...")
        logger.info("Checking and seeding 'ADMIN' role...")
        admin_role = session.query(RoleModel).filter_by(name="ADMIN").first()
        if not admin_role:
            admin_role = RoleModel(
                name="ADMIN",
                description="Super administrator with all permissions"
            )
            session.add(admin_role)
            session.commit()
            session.refresh(admin_role)
            print("✅ Successfully created 'ADMIN' role.")
            logger.info("Successfully created 'ADMIN' role.")
        else:
            print("ℹ️ 'ADMIN' role already exists.")
            logger.info("'ADMIN' role already exists.")

        # Check if username or email already exists
        existing_user = session.query(UserModel).filter(
            (UserModel.username == username) | (UserModel.email == email)
        ).first()

        if existing_user:
            print(f"⚠️ User with username '{username}' or email '{email}' already exists.")
            overwrite = input("Do you want to update this user's password? (y/n): ").strip().lower()
            if overwrite == 'y':
                print("🔑 Encrypting password using Argon2 and secret key from .env...")
                hashed_password = ph.hash(f"{password}{settings.SECRET_KEY}")
                existing_user.password_hash = hashed_password
                session.commit()
                print(f"✅ Successfully updated superuser '{username}' password.")
                logger.info(f"Updated superuser '{username}' password.")
            else:
                print("ℹ️ Operation cancelled. No changes made.")
        else:
            print("🔑 Encrypting password using Argon2 and secret key from .env...")
            hashed_password = ph.hash(f"{password}{settings.SECRET_KEY}")
            
            new_superuser = UserModel(
                username=username,
                email=email,
                password_hash=hashed_password,
                account_type=AccountEnum.admin,
                is_active=True,
                is_password_reset=False,
                role_id=admin_role.id
            )
            session.add(new_superuser)
            session.commit()
            print(f"✅ Superuser created successfully: username='{username}', email='{email}'")
            logger.info(f"Superuser created successfully: {username}")

    except Exception as e:
        session.rollback()
        print("❌ An error occurred during superuser creation!")
        logger.exception("An error occurred during superuser creation:")
        sys.exit(1)
    finally:
        session.close()
        print("🔌 Database session closed.\n")
        logger.info("Database session closed.")

if __name__ == "__main__":
    create_superuser()
