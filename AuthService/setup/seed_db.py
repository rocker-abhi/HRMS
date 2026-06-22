import sys
import os
import logging

# Ensure the root of the AuthService is in sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.extensions.configurations import settings
from src.extensions import database_extension as db
from src.models.permission import PermissionModel
from src.models.role import RoleModel

# Setup basic logging to stdout
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)
logger = logging.getLogger("seed_db")


# 1. Complete list of permissions
PERMISSIONS_TO_SEED = {
    "add books": "Allows adding new books to the library system",
    "view books": "Allows viewing books in the library system",
    "update books": "Allows updating existing book details",
    "delete books": "Allows deleting books from the library system",
    "borrowed books": "Allows borrowing books",
    "return books": "Allows returning borrowed books",
    "view own borrow books": "Allows viewing one's own borrowing history and status",
    "view all borrow records": "Allows viewing borrowing records of all users",
    "view own fine": "Allows viewing one's own fines",
    "view all fine": "Allows viewing all fines in the system",
    "waiver fine": "Allows waiving or reducing fines for users",
    "create user": "Allows creating new user accounts",
    "manage user": "Allows managing existing user accounts",
    "view report": "Allows viewing system and library reports",
}

# 2. Role to Permission mapping
ROLES_TO_PERMISSIONS = {
    "ADMIN": [
        "add books",
        "view books",
        "update books",
        "delete books",
        "view all borrow records",
        "view all fine",
        "waiver fine",
        "create user",
        "manage user",
        "view report"
    ],
    "SUPERVISOR": [
        "add books",
        "view books",
        "update books",
        "return books",
        "view all borrow records",
        "view all fine",
        "view report"
    ],
    "STUDENT": [
        "view books",
        "borrowed books",
        "return books",
        "view own borrow books",
        "view own fine"
    ]
}

def seed_database():
    print("\n🚀 Initializing database connection...")
    logger.info("Initializing database connection...")
    db.init_db(settings.DATABASE_URL)
    
    if db.postgres_database is None:
        print("❌ Database connection initialization failed.")
        logger.error("Database connection initialization failed.")
        sys.exit(1)

    session = db.postgres_database.SessionLocal()
    try:
        # --- A. Seed Permissions ---
        print("🔍 Checking existing permissions in database...")
        logger.info("Checking and seeding permissions...")
        existing_perms = session.query(PermissionModel).all()
        existing_perm_names = {p.name for p in existing_perms}

        new_perms = []
        for name, desc in PERMISSIONS_TO_SEED.items():
            if name not in existing_perm_names:
                new_perms.append(PermissionModel(name=name, description=desc))

        if new_perms:
            session.add_all(new_perms)
            session.commit()
            print(f"✅ Successfully seeded {len(new_perms)} new permissions.")
            logger.info(f"Seeded {len(new_perms)} permissions.")
        else:
            print("ℹ️ All permissions already exist in the database.")
            logger.info("No new permissions to seed.")

        # Reload all permissions from DB
        all_perms = {p.name: p for p in session.query(PermissionModel).all()}

        # --- B. Seed Roles and Link Permissions ---
        admin_role_obj = None
        for role_name, perm_names in ROLES_TO_PERMISSIONS.items():
            print(f"👤 Processing role '{role_name}'...")
            logger.info(f"Processing role: {role_name}")

            # Check if role exists
            role = session.query(RoleModel).filter_by(name=role_name).first()
            if not role:
                role = RoleModel(
                    name=role_name,
                    description=f"{role_name.capitalize()} role with designated permissions."
                )
                session.add(role)
                session.commit()
                session.refresh(role)
                print(f"   ✅ Created role '{role_name}'")
                logger.info(f"Created role: {role_name}")
            else:
                print(f"   ℹ️ Role '{role_name}' already exists.")
                logger.info(f"Role '{role_name}' already exists.")

            # Map the permission objects
            target_perms = []
            for p_name in perm_names:
                if p_name in all_perms:
                    target_perms.append(all_perms[p_name])
                else:
                    logger.warning(f"Permission '{p_name}' not found in database; skipping.")

            # Assign permissions to role (idempotent replacement)
            role.permissions = target_perms
            session.commit()
            print(f"   🔗 Associated {len(target_perms)} permissions with '{role_name}'.")
            logger.info(f"Associated {len(target_perms)} permissions with role '{role_name}'")

        # Seeding completed
        print("🎉 Database seeding completed successfully!")
        logger.info("Database seeding completed.")

    except Exception as e:
        session.rollback()
        print("❌ An error occurred during database seeding!")
        logger.exception("An error occurred during database seeding:")
        sys.exit(1)
    finally:
        session.close()
        print("🔌 Database session closed.\n")
        logger.info("Database session closed.")

if __name__ == "__main__":
    seed_database()
