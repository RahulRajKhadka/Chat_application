import type {
    NextFunction,
    Request,
    Response,
    RequestHandler,
} from "express";

const TryCatch = <T extends Request>(
    handler: (
        req: T,
        res: Response,
        next: NextFunction
    ) => Promise<void>
): RequestHandler => {
    return async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            await handler(req as T, res, next);
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    };
};

export default TryCatch;