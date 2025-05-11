from sqlalchemy import Column, Integer, String, ForeignKey, Float, Date, DateTime
from sqlalchemy.orm import relationship
from .database import Base
import datetime

class Sale(Base):
    __tablename__="Sale"
    sale_id=Column(Integer, primary_key=True, index=True)
    sale_date=Column(Date, default=datetime.datetime.utcnow)
    customer_id=Column(Integer, ForeignKey("Staff.staff_id"))
    total_amount=Column(Float)
    payment_method=Column(String)
    payment_status=Column(String)

    Sale_items=relationship("SaleItem", back_populates="Sale")

class Book(Base):
    __tablename__="Book"
    book_id=Column(Integer,primary_key=True,index=True)
    book_title=Column(String)
    book_ISBN=Column(Integer)
    language_id=Column(Integer,ForeignKey("Language.language_id"))
    author_id=Column(Integer,ForeignKey("Author.author_id"))
    publisher_id=Column(Integer,ForeignKey("Publisher.publisher_id"))
    publish_year=Column(Date)
    category_id=Column(Integer,ForeignKey("Category.category_id"))
    stock_quantity=Column(Integer)
    book_price=Column(Float)

    Sale_items=relationship("SaleItem",back_populates="Book")

class SaleItem(Base):
    __tablename__="Sale_item"
    saleitem_id=Column(Integer,primary_key=True,index=True)
    sale_id=Column(Integer,ForeignKey("Sale.sale_id"))
    book_id=Column(Integer,ForeignKey("Book.book_id"))
    quantity=Column(Integer)
    unit_price=Column(Float)
    subtotal=Column(Float)

    Sale=relationship("Sale",back_populates="Sale_item")
    Book=relationship("Book",back_populates="Sale_item")

class Customer(Base):
    __tablename__="Customer"
    customer_id=Column(Integer,primary_key=True,index=True)
    customer_fname=Column(String, nullable=False)
    customer_mname=Column(String, nullable=False)
    customer_lname=Column(String, nullable=False)
    customer_email=Column(String, nullable=False)
    customer_phone=Column(String)
    customer_address=Column(String)
    membership_status=Column(String, nullable=False)

    Sale=relationship("Sale",back_populates="Customer")

class Staff(Base):
    __tablename__="Staff"
    staff_id=Column(Integer,primary_key=True,index=True)
    staff_fname=Column(String, nullable=False)
    staff_mname=Column(String, nullable=False)
    staff_lname=Column(String, nullable=False)
    staff_email=Column(String, nullable=False)
    staff_phone=Column(String)
    staff_address=Column(String)
    position=Column(String, nullable=False)
    hire_date=Column(Date, nullable=False)
    staff_status=Column(String, nullable=False)
    staff_username=Column(String, nullable=False)
    staff_password=Column(String, nullable=False)

    Sale=relationship("Sale",back_populates="Staff")

class Language(Base):
    __tablename__="Language"
    language_id=Column(Integer,primary_key=True,index=True)
    language_name=Column(String)

    Book=relationship("Book",back_populates="Language")

class Author(Base):
    __tablename__="Author"
    author_id=Column(Integer, primary_key=True,index=True)
    author_name=Column(String)

    Book=relationship("Book",back_populates="Author")

class Publisher(Base):
    __tablename__="Publisher"
    publisher_id=Column(Integer,primary_key=True,index=True)
    publisher_name=Column(String)
    publisher_address=Column(String)

    Book=relationship("Book",back_populates="Publisher")

class Category(Base):
    __tablename__="Category"
    category_id=Column(Integer, primary_key=True,index=True)
    category_name=Column(String, nullable=False)
    genres_id=Column(Integer,ForeignKey("Genres.genres_id"))

    Book=relationship("Book",back_populates="Category")

class Genres(Base):
    __tablename__="Genres"
    genres_id=Column(Integer,primary_key=True,index=True)
    genres=Column(String, nullable=False)

    Category=relationship("Category",back_populates="Genres")