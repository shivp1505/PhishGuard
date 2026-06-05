import { NextFunction, Request, Response } from "express";
import { ErrorResponse } from "../types/analysis";

export function validateAnalyzeRequest(
  req: Request,
  res: Response<ErrorResponse>,
  next: NextFunction
) {
  const { message, sender, subject, url } = req.body ?? {};

  if (typeof message !== "string" || message.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "Message body is required."
    });
  }

  if (message.length > 10000) {
    return res.status(413).json({
      success: false,
      message: "Message body must be 10,000 characters or fewer."
    });
  }

  for (const [field, value, maxLength] of [
    ["sender", sender, 500],
    ["subject", subject, 500],
    ["url", url, 2000]
  ] as const) {
    if (value !== undefined && typeof value !== "string") {
      return res.status(400).json({
        success: false,
        message: `${field} must be a string.`
      });
    }

    if (typeof value === "string" && value.length > maxLength) {
      return res.status(413).json({
        success: false,
        message: `${field} must be ${maxLength} characters or fewer.`
      });
    }
  }

  next();
}
