
import { NannyesCollection } from "../db/models/nanny.js";

export const getAllNannyes = async () => {
  const nannyes = await NannyesCollection.find();
  return nannyes;
};


export const getNannyById = async (nannyId) => {
  const nanny = await NannyesCollection.findById(nannyId);
  return nanny;
};



