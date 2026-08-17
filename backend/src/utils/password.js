import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12; // number of times the hashing algorithm executes: 2^12 iterations

export const hashPassword = async (password) => {
    return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (password, hashPassword) => {
    return bcrypt.compare(password, hashPassword);
};