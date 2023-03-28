import Poll, { IPoll } from "./models/Poll.model";

export const createVoting = async (poll: IPoll) => Poll.create(poll);

export const getPoll = async (hash: string) => Poll.findOne({ hash });
