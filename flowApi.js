// flowApi.js
require('dotenv').config();
const axios = require('axios');
const crypto = require('crypto');
const qs = require('qs');

const API_KEY = process.env.API_KEY;
const SECRET_KEY = process.env.SECRET_KEY;
const FLOW_API_URL = process.env.FLOW_API_URL;

function signParams(params) {
  const paramsToSign = { ...params };
  delete paramsToSign.s;

  // Ordenar los parámetros alfabéticamente
  const keys = Object.keys(paramsToSign).sort();
  let toSign = '';
  keys.forEach((key) => {
    toSign += key + paramsToSign[key];
  });

  console.log('String a firmar:', toSign);

  const signature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(toSign)
    .digest('hex');
  return signature;
}

async function flowRequest(method, endpoint, params) {
  params.apiKey = API_KEY;
  params.s = signParams(params);

  console.log('Parámetros a enviar:', params);

  const url = `${FLOW_API_URL}${endpoint}`;

  try {
    let response;
    if (method.toUpperCase() === 'GET') {
      // Para solicitudes GET, los parámetros van en la URL
      response = await axios.get(url, { params });
    } else {
      // Para solicitudes POST, enviar todos los parámetros en el cuerpo
      const data = qs.stringify(params);
      console.log('Datos del cuerpo:', data);

      response = await axios.post(url, data, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 5000, // Ajusta el timeout si es necesario
      });
    }
    return response.data;
  } catch (error) {
    console.error(
      'Error en la solicitud:',
      error.response ? error.response.data : error.message
    );
    throw error.response ? error.response.data : error;
  }
}

module.exports = {
  flowRequest,
};