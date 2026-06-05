import { Router } from "express";
import { validateAnalyzeRequest } from "../middleware/validateAnalyzeRequest";
import { analyzeMessage } from "../services/phishingAnalyzer";
import { AnalyzeRequest, AnalyzeResponse, ErrorResponse } from "../types/analysis";

export const analyzeRouter = Router();

analyzeRouter.post<{}, AnalyzeResponse | ErrorResponse, AnalyzeRequest>(
  "/",
  validateAnalyzeRequest,
  (req, res) => {
    const result = analyzeMessage({
      sender: req.body.sender ?? "",
      subject: req.body.subject ?? "",
      message: req.body.message.trim(),
      url: req.body.url ?? ""
    });

    res.json(result);
  }
);
