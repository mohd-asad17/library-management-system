import { cancelBookRequest, createBookRequests, getMyBookRequests, getMyBookRequestsById } from "../services/bookRequest.service.js";


const createBookRequestController = async (req, res) => {
    try {
        const studentId = Number(req.user.userId);
        const bookId = Number(req.body.bookId);
        
        if(!Number.isInteger(studentId) || bookId <= 0){
            return res.status(400).json({
                success: false,
                message: "Invalid book Id"
            });
        }

        const bookRequest = await createBookRequests(studentId, bookId);

        return res.status(200).json({
            success: true,
            message: "Book Request created successfully",
            data: bookRequest
        });

    } catch (error) {
        console.log("Book request error: ", error);

        if (error.message === "BOOK_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "Book not found",
            });
        }

        if (error.message === "NO_AVAILABLE_COPY") {
            return res.status(409).json({
                success: false,
                message: "No available copy of this book",
            });
        }

        if (error.message === "ALREADY_ISSUED") {
            return res.status(409).json({
                success: false,
                message: "You already have this book issued",
            });
        }

        if(error.code === "23505"){
            return res.status(409).json({
                success: false,
                message: "You already have a pending request for this book",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to create book request",
        });
    }
};

const getMyBookRequestController = async (req, res) => {
    try {
        const studentId = Number(req.user.userId);
        const request = await getMyBookRequests(studentId);

        return res.status(200).json({
            success: true,
            count: requests.length,
            data: requests,
        })
    } catch (error) {
        console.log("Get my book requests error: ", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch the book request"
        });
    }
};

const getBookRequestByIdController = async (req, res) =>{
    try {
        const requestId = Number(req.params.id);

        if(!Number.isInteger(requestId) || requestId <= 0){
            return res.status(400).json({
                success: false,
                message: "Invalid request Id"
            });
        }

        const request = await getMyBookRequestsById({
            requestId,
            userId: req.user.userId,
            role: req.user.role
    });

        if(!request){
            return res.status(404).json({
                success: false, 
                message: "Book request not found"
            });
        }

        if (request.forbidden) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to view this request",
            });
        }

        return res.status(200).json({
            success: true,
            data: request
        });

    } catch (error) {
        console.log("Book request by Id error: ", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch book request",
        });
    }
};


const cancelBookRequestController = async (req, res) => {
    try {
        const studentId = Number(req.user.userId);
        const requestId = Number(req.params.id);

        if(!Number.isInteger(requestId) || requestId  <= 0){
            return res.status(404).json({
                success: false,
                message: "Invalid book request Id"
            });
        }

        const request = await cancelBookRequest(requestId, studentId);

        if(!request) {
            return res.status(404).json({
                success: false, 
                message: "Pending book request not found"
            })
        }
        return res.status(200).json({
            success: true,
            message: "Book request cancel successfully"
        });
    } catch(error){
        console.log("Cancel book request error: ", error);

        return res.status(500).json({
            success: false, 
            message: "Failed to cancel the book request"
        });
    }
};

export {
    createBookRequestController,
    getMyBookRequestController,
    getBookRequestByIdController,
    cancelBookRequestController
}