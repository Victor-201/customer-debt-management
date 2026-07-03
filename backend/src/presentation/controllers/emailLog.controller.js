export default class EmailLogController {
    constructor({ getAllEmailLogsUseCase }) {
        this.getAllEmailLogsUseCase = getAllEmailLogsUseCase;
    }

    async getAllLogs(req, res, next) {
        try {
            const { page = 1, limit = 100 } = req.query;
            const result = await this.getAllEmailLogsUseCase.execute({
                page: parseInt(page, 10),
                limit: parseInt(limit, 10)
            });
            res.json(result);
        } catch (error) {
            next(error);
        }
    }
}
