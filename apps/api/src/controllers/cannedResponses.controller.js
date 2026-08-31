import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { CannedResponse } from '../models/index.js';

export const listCannedResponses = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.intent) filter.intent = req.query.intent;
  if (req.query.language) filter.language = req.query.language;
  const items = await CannedResponse.find(filter).sort({ intent: 1, priority: -1 });
  res.json({ data: items });
});

export const createCannedResponse = asyncHandler(async (req, res) => {
  const item = await CannedResponse.create(req.body);
  res.status(201).json({ data: item });
});

export const updateCannedResponse = asyncHandler(async (req, res) => {
  const item = await CannedResponse.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!item) throw ApiError.notFound('Canned response not found');
  res.json({ data: item });
});

export const deleteCannedResponse = asyncHandler(async (req, res) => {
  const item = await CannedResponse.findByIdAndDelete(req.params.id);
  if (!item) throw ApiError.notFound('Canned response not found');
  res.json({ data: { id: item._id } });
});
