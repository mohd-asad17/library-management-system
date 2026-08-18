import { createBookCopy, deleteBookCopy, getBookCopies, getBookCopyById, updateBookByStatus} from "../services/bookCopy.service.js";
import { getBookById } from "../services/book.service.js";


const createBookCopyController = async (req, res) => {
    try {
        const {bookId }  = req.params;
        const {accession_number} = req.body;

        if(!accession_number) {
            return res.status(400).json({
                success: false,
                message: "Access number is required"
            });
        }

        const book = await getBookById(bookId);

        if(!book) {
            return res.status(404).json({
                success: false,
                message: "Book not found"
            });
        }

        const bookCopy = await createBookCopy(
            bookId,
         accession_number.trim());

        return res.status(201).json({
            success: true,
            message: "Book copy created successfully",
            data: bookCopy
        });
    } catch(error){
        console.log("book copy error:", error);

        if (error.code === "23505") {
            return res.status(409).json({
                success: false,
                message: "Accession number already exists",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to create book copy",
        })
    }
};


const getBookCopiesController = async (req, res) => {
    try {
        const {bookId} = req.params;

    const book = await getBookById(bookId);

    if(!book) {
        return res.status(404).json({
            success: false,
            message: "Book not found"
        });
    }

    const copies = await getBookCopies(bookId);

    return res.status(200).json({
        success: true,
        count: copies.length,
        data: copies
    });
    } catch(error) {
        console.log("getting book copies error:", error);

        return res.status(400).json({
            success: false, 
            message: "Failed to fetch the book copies"
        });
    }
};

const getBookCopyByIdController = async (req, res) => {
    try {
        const {id} = req.params;

        const copy = await getBookCopyById(id);

        console.log("Copy of book ", copy);

        if(!copy) {
            return res.status(404).json({
                success: false,
                message: "Book copy not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: copy,
        });
    } catch (error) {
        console.error("Get book copy error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch book copy",
        });
    }
};

const updateBookCopyByStatusController = async (req, res) => {
    try {
        const { id } = req.params;
        const {status } = req.body;

        const bookStatus = [ 'AVAILABLE', 'ISSUED', 'LOST', 'DAMAGED', 'UNAVAILABLE'];

        if(!status || !bookStatus.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Status must be one of ${bookStatus.join(" , ")}`
            })
        }
        const copy = await getBookCopyById(id);

        if(!copy) {
            return res.status(404).json({
                success: false,
                message: "Book copy not found"
            });
        }

        const updateBookCopy = await updateBookByStatus(id, status);

        return res.status(200).json({
            success: true,
            message: "Book copy status updated successfully",
            data: updateBookCopy,
        });

    } catch (error) {
        console.error("Update book copy status error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update book copy status",
        });
    }
};


const removeBookCopyController = async (req, res) => {
   try {
    const {id} = req.params;

    const copy = await getBookCopyById(id);

    if(!copy) {
        return res.status(404).json({
            success: false,
            message: "Book copy not found"
        });
    }

    if(copy.status === 'ISSUED') {
        return res.status(409).json({
            success: false,
            message: "Issued book copy can not be deleted"
        });
    }

    const deleteCopy = await deleteBookCopy(id);

    return res.status(200).json({
        success: true,
        message: "Book copy deleted successfully",
        data: deleteCopy,
    });
   } catch(error) {
    console.log("Delete book copy error:" , error);

    
    if (error.code === "23503") {
        return res.status(409).json({
            success: false,
            message: "Book copy cannot be deleted because it is referenced by another record",
        });
    }

    return res.status(500).json({
        success: false, 
        message: "Failed to delete book copy"
    })
   }
}

export {
    createBookCopyController,
    getBookCopiesController,
    getBookCopyByIdController,
    updateBookCopyByStatusController,
    removeBookCopyController
}