import os
import sys

# Define absolute paths to ensure imports from the src directory work
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)
sys.path.append(PROJECT_ROOT)

from dotenv import load_dotenv
load_dotenv(dotenv_path=os.path.join(PROJECT_ROOT, ".env"))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from src.extensions.configurations import settings
from src.models.category import CategoryModel

CATEGORIES = [
    "Fiction",
    "Literary Fiction",
    "Historical Fiction",
    "Science Fiction",
    "Fantasy",
    "Mystery",
    "Thriller",
    "Horror",
    "Adventure",
    "Crime",
    "Romance",
    "Young Adult",
    "Children's Fiction",
    "Short Stories",
    "Drama",
    "Classics",
    "Biography",
    "Autobiography",
    "Memoir",
    "Self-Help",
    "Personal Development",
    "Psychology",
    "Philosophy",
    "Religion",
    "Spirituality",
    "Politics",
    "Economics",
    "Sociology",
    "Anthropology",
    "History",
    "Geography",
    "Computer Science",
    "Programming",
    "Software Engineering",
    "Data Science",
    "Artificial Intelligence",
    "Machine Learning",
    "Cybersecurity",
    "Networking",
    "Cloud Computing",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Astronomy",
    "Environmental Science",
    "Business",
    "Entrepreneurship",
    "Leadership",
    "Management",
    "Marketing",
    "Finance",
    "Accounting",
    "Human Resources",
    "Project Management",
    "Operations Management",
    "Education",
    "Academic Textbooks",
    "Reference Books",
    "Dictionaries",
    "Encyclopedias",
    "Research",
    "Study Guides",
    "Competitive Exams",
    "Art",
    "Music",
    "Photography",
    "Design",
    "Architecture",
    "Fashion",
    "Film & Cinema",
    "Performing Arts",
    "Health & Fitness",
    "Nutrition",
    "Cooking",
    "Travel",
    "Sports",
    "Hobbies",
    "Gardening",
    "Home Improvement",
    "Picture Books",
    "Early Readers",
    "Children's Non-Fiction",
    "Educational Books",
    "Medicine",
    "Nursing",
    "Law",
    "Engineering",
    "Agriculture",
    "Veterinary Science",
    "Comics",
    "Graphic Novels",
    "Manga",
    "Entertainment",
    "Poetry",
    "Language Learning",
    "Communication Skills",
    "Journalism",
    "Media Studies",
    "Culture",
    "Social Sciences",
    "Technology",
    "Space Science",
    "Political Science",
    "Public Administration",
    "Environmental Studies",
    "Ethics",
    "Mythology",
    "Folklore",
    "True Crime",
    "Military History",
    "Career Development",
    "Investment",
    "Real Estate",
    "Startup",
    "E-Commerce",
    "Digital Marketing",
    "DevOps",
    "Database Systems",
    "Web Development",
    "Mobile Development",
    "Game Development",
    "Blockchain",
    "Internet of Things",
    "Robotics"
]

def seed():
    print("Starting category seeding...")
    db_url = settings.DATABASE_URL
    print(f"Connecting to database using settings URL...")
    
    engine = create_engine(db_url)
    SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    session = SessionLocal()
    
    try:
        # Query existing categories in the database
        existing_categories = {c.name for c in session.query(CategoryModel).all()}
        print(f"Found {len(existing_categories)} existing categories in database.")
        
        inserted_count = 0
        skipped_count = 0
        
        for category_name in CATEGORIES:
            category_name = category_name.strip()
            if category_name in existing_categories:
                skipped_count += 1
                continue
            
            category = CategoryModel(
                name=category_name,
                description=f"Books related to {category_name}"
            )
            session.add(category)
            inserted_count += 1
            # Add to the local set to prevent any double inserts in case of duplicate inputs
            existing_categories.add(category_name)
            
        if inserted_count > 0:
            session.commit()
            print(f"Successfully seeded {inserted_count} new categories.")
        else:
            print("No new categories to seed.")
            
        print(f"Total categories checked: {len(CATEGORIES)}")
        print(f"Skipped (already exists): {skipped_count}")
        
    except Exception as e:
        session.rollback()
        print(f"An error occurred during seeding: {e}")
        sys.exit(1)
    finally:
        session.close()

if __name__ == "__main__":
    seed()
