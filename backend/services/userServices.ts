import User from '../models/userModel';

export const createUser = async (name: string, email: string, password: string) => {
  const user = new User({ name, email, password });
  await user.save();
  return user;
};
