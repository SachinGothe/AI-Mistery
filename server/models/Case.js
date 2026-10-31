import mongoose from 'mongoose';
const { Schema } = mongoose;
const CaseSchema = new Schema({
  title: String, premise: String, story: String,
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
  suspects: [{ _id: false, id: String, name: String, role: String, description: String, alibi: String }],
  clues: [{ _id: false, id: String, label: String, text: String, discovered: { type: Boolean, default: false } }],
  hints: [String],
  interrogations: [{ _id: false, suspectId: String, question: String, answer: String }],
  hintsUsed: { type: Number, default: 0 },
  solution: { culpritId: String, explanation: String },
  accusation: { suspectId: String, correct: Boolean },
  score: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'solved'], default: 'active' },
}, { timestamps: true });
export default mongoose.model('Case', CaseSchema);
