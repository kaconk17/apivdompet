const moment = require('moment');

const {pool} = require('../config/connection');

const {
  hashPassword,
  comparePassword,
  isValidEmail,
  validatePassword,
  isEmpty,
  generateUserToken,
} = require('../helpers/validations');

const {
  errorMessage, successMessage, status,
}  = require('../helpers/status');

const { v4:uuidv4} = require('uuid');

/**
   * Create A User
   * @param {object} req
   * @param {object} res
   * @returns {object} reflection object
   */
const createUser = async (req, res) => {
  const {
    nama, email, password,
  } = req.body;

  const created_on = moment(new Date());
  if (isEmpty(email) || isEmpty(nama) || isEmpty(password)) {
    errorMessage.error = 'Nama ,email, password, tidak boleh kosong';
    return res.status(status.bad).send(errorMessage);
  }
  if (!isValidEmail(email)) {
    errorMessage.error = 'Masukkan Email yang valid';
    return res.status(status.bad).send(errorMessage);
  }
  if (!validatePassword(password)) {
    errorMessage.error = 'Password harus lebih dari lima(5) karakter';
    return res.status(status.bad).send(errorMessage);
  }
  const id = uuidv4();
  const hashedPassword = hashPassword(password);
  const createUserQuery = `INSERT INTO
      tb_users(id, nama, email, password, created_at)
      VALUES($1, $2, $3, $4, $5)
      returning *`;
  const values = [
    id,
    nama,
    email,
    hashedPassword,
    created_on,
  ];

  try {
    const { rows } = await pool.query(createUserQuery, values);
    const dbResponse = rows[0];
    delete dbResponse.password;
    const token = generateUserToken(dbResponse.email, dbResponse.id);
    successMessage.data = dbResponse;
    successMessage.data.token = token;
    return res.status(status.created).send(successMessage);
  } catch (error) {
    if (error.routine === '_bt_check_unique') {
      errorMessage.error = 'Email sudah terdaftar';
      return res.status(status.conflict).send(errorMessage);
    }
    errorMessage.error = 'Insert user gagal';
    return res.status(status.error).send(errorMessage);
  }
};

/**
   * Signin
   * @param {object} req
   * @param {object} res
   * @returns {object} user object
   */
const siginUser = async (req, res) => {
  const { email, password } = req.body;
  if (isEmpty(email) || isEmpty(password)) {
    errorMessage.error = 'Email atau Password belum diisi';
    return res.status(status.bad).send(errorMessage);
  }
  if (!isValidEmail(email) || !validatePassword(password)) {
    errorMessage.error = 'Masukkan email atau password yang valid';
    return res.status(status.bad).send(errorMessage);
  }
  const signinUserQuery = 'SELECT * FROM tb_users WHERE email = $1';
  try {
    const { rows } = await pool.query(signinUserQuery, [email]);
    const dbResponse = rows[0];
    if (!dbResponse) {
      errorMessage.error = 'User tidak ditemukan';
      return res.status(status.notfound).send(errorMessage);
    }
    if (!comparePassword(dbResponse.password, password)) {
      errorMessage.error = 'Password salah';
      return res.status(status.bad).send(errorMessage);
    }
    const token = generateUserToken(dbResponse.email, dbResponse.id);
    delete dbResponse.password;
    successMessage.data = dbResponse;
    successMessage.data.token = token;
    return res.status(status.success).send(successMessage);
  } catch (error) {
    errorMessage.error = 'Operation was not successful';
    return res.status(status.error).send(errorMessage);
  }
};

const getUser = async (req, res) => {
  const { email } = req.body;
 
  const signinUserQuery = 'SELECT * FROM tb_users WHERE email = $1';
  try {
    const { rows } = await pool.query(signinUserQuery, [email]);
    const dbResponse = rows[0];
    if (!dbResponse) {
      errorMessage.error = 'User tidak ditemukan';
      return res.status(status.notfound).send(errorMessage);
    }
    const token = generateUserToken(dbResponse.email, dbResponse.id);
    delete dbResponse.password;
    successMessage.data = dbResponse;
    successMessage.data.token = token;
    return res.status(status.success).send(successMessage);
  } catch (error) {
    errorMessage.error = 'Operation was not successful';
    return res.status(status.error).send(errorMessage);
  }
};

module.exports = {
  createUser,
  siginUser,
  getUser,
};