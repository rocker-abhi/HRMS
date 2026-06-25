import sys
import os
import grpc
import logging
import uuid

# Add the parent folder of src to path, which is BookService root
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))
# Add generated folder to path
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'generated'))

import book_grpc_pb2
import book_grpc_pb2_grpc

from src.extensions.database_extension import postgres_database
from src.repository.database_repository import BookRepository

logger = logging.getLogger(__name__)

class BookServiceServicer(book_grpc_pb2_grpc.BookServiceServicer):
    def GetBookDetails(self, request, context):
        book_id = request.book_id
        logger.info(f"Received gRPC GetBookDetails request for book_id: {book_id}")
        if not book_id:
            context.set_code(grpc.StatusCode.INVALID_ARGUMENT)
            context.set_details("book_id is required")
            return book_grpc_pb2.GetBookResponse(title="", author="")
        
        try:
            bid = uuid.UUID(book_id)
        except ValueError:
            context.set_code(grpc.StatusCode.INVALID_ARGUMENT)
            context.set_details("Invalid UUID format for book_id")
            return book_grpc_pb2.GetBookResponse(title="", author="")
        
        db = postgres_database.SessionLocal()
        try:
            repo = BookRepository(db)
            book = repo.get_book_by_id(bid)
            if not book:
                context.set_code(grpc.StatusCode.NOT_FOUND)
                context.set_details(f"Book with ID {book_id} not found")
                return book_grpc_pb2.GetBookResponse(title="", author="")
            
            # Form list of authors
            authors_list = [f"{a.author.first_name} {a.author.last_name}" for a in book.authors] if book.authors else []
            author_names = ", ".join(authors_list)
            
            return book_grpc_pb2.GetBookResponse(title=book.title, author=author_names)
        except Exception as e:
            logger.error(f"Error querying book database: {e}")
            context.set_code(grpc.StatusCode.INTERNAL)
            context.set_details("Internal server error")
            return book_grpc_pb2.GetBookResponse(title="", author="")
        finally:
            db.close()
