import { createBook, deleteBook, getAllBooks, getBookById, updateBook } from "../services/book.service.js";

const createBookController = async (req, res) => {
  try {

    const { title, author, isbn, category, publisher, description } = req.body;

    const isInValid = !title || !author;
    if (isInValid) {
      return res.status(400).json({
        success: false,
        message: "Title and Author are required",
      });
    }

      const book = await createBook({
        title: title.trim(),
        author: author.trim(),
        isbn: isbn?.trim() || null,
        category: category?.trim() || null,
        publisher: publisher?.trim() || null,
        description: description?.trim() || null,
      });

      return res.status(200).json({
        success: true,
        message: "Book successfully added",
        data: book
      });
  } catch (error) {
    console.log("error", error);

    // 23505 -> UNIQUE VIOLATION -> This error code occur when you try to add or update data that is already exists.
    if (error.code === "23505") {
        return res.status(409).json({
            success: false,
            message: "A book with this ISBN already exists",
        });
    }

    return res.status(500).json({
        success: false,
        message: "Failed to create book",
    });
  }
};


const getAllBooksController = async (req, res) => {
    try {
        const books = await getAllBooks();

        return res.status(200).json({
            success: true,
            count: books.length,
            data: books
        });
    } catch(error){
        console.log("get books error", error);

        return res.status(400).json({
            success: false, 
            message: "Failed to fetch the books"
        });
    }
};

const getBookController = async (req, res) => {
    try {
        const {id} = req.params;

        const book = await getBookById(id);

        if(!book){
            return res.status(404).json({
                success: false,
                message: "Book not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: book,
            message: "Successfully fetched"
        });
    } catch(error){
        console.log("Error ", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch book",
        });
    }
};


const updateBookController = async (req, res) => {
    try {
        const {id} = req.params;

        const  {title, author, isbn, category, publisher, description} = req.body;

        if ( title === undefined &&
            author === undefined &&
            isbn === undefined &&
            category === undefined &&
            publisher === undefined &&
            description === undefined ) {
            return res.status(400).json({
                success: false,
                message: "At least one field is required for update",
            });
        }

        const book = await updateBook(id, {
            title: title?.trim(),
            author: author?.trim(),
            isbn: isbn?.trim(),
            category: category?.trim(),
            publisher: publisher?.trim(),
            description: description?.trim(),
        });

        if(!book) {
            return res.status(404).json({
                success: false,
                message: "Unable to found book"
            });
        }
        return res.status(200).json({
            success: true,
            message: "Book updated Successfully",
            data: book
        });

    } catch(error) {
        console.error("Update book error:", error);

        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "A book with this ISBN already exists",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to update book",
        });
    }
};


const removeBookController = async (req, res) => {
    try {
        const {id} = req.params;

    const book = await deleteBook(id);

    if(!book) {
        return res.status(404).json({
            success: false,
            message: "Book not found"
        });
    }

    return res.status(200).json({
        success: true,
        message: "Book deleted successfully",
        data: book
    });
    } catch (error) {
        console.log("Delete book error", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete book",
        });
    }
};


export {
    createBookController,
    getAllBooksController,
    getBookController,
    updateBookController,
    removeBookController
}