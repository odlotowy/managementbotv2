import { Schema, model } from "mongoose";

const ManagerSchema = new Schema({
  discordId: { type: String, required: true, unique: true },
  roblox: {
    userId: { type: String, required: true },
    username: { type: String, required: true },
    avatar: { type: String, default: "" },
    rankgroup: { type: String, required: true },
    rankgroupid: { type: Number, required: true },
  },
  stats: {
    loggedShifts: { type: Number, default: 0 },
    tickets: { type: Number, default: 0 },
    staffOfTheMonthRequests: { type: Number, default: 0 },
  },
  activity: {
    streak: { type: Number, default: 0 },
    strikes: { type: Number, default: 0 },
    isMOTW: { type: Boolean, default: false },
    isMOTM: { type: Boolean, default: false },
    motwCount: { type: Number, default: 0 },
  },
});

export const Manager = model("Manager", ManagerSchema);
