// routes/flow.js
const express = require('express');
const router = express.Router();
const { flowRequest } = require('../flowApi');

router.post('/createCustomer', async (req, res) => {
  const { name, email, externalId } = req.body;
  console.log('Parámetros recibidos en /createCustomer:', req.body);

  if (!name || !email || !externalId) {
    return res.status(400).json({ error: 'Faltan parámetros requeridos' });
  }

  const params = {
    name,
    email,
    externalId,
  };

  try {
    const response = await flowRequest('POST', '/customer/create', params);
    res.json(response);
  } catch (error) {
    console.error('Error al crear el cliente:', error);
    res.status(400).json({ error });
  }
});

router.post('/createSubscription', async (req, res) => {
  const {
    planId,
    customerId,
    subscription_start,
    couponId,
    trial_period_days,
    periods_number,
  } = req.body;

  console.log('Parámetros recibidos en /createSubscription:', req.body);

  if (!planId || !customerId) {
    return res
      .status(400)
      .json({ error: 'Faltan parámetros requeridos: planId y customerId' });
  }

  const params = {
    planId,
    customerId,
    ...(subscription_start && { subscription_start }),
    ...(couponId && { couponId }),
    ...(trial_period_days && { trial_period_days }),
    ...(periods_number && { periods_number }),
  };

  try {
    let response = await flowRequest(
      'POST',
      '/subscription/create',
      params
    );

    console.log('Respuesta de creación de suscripción:', response);

    const subscriptionId = response.subscriptionId;

    if (!subscriptionId) {
      return res.status(400).json({ error: 'No se pudo crear la suscripción' });
    }

    console.log('Suscripción creada:', response);
    console.log("=========================aa=========");
    console.log('LINK:', response.invoices[0].id);
    let invoiceId = response.invoices[0].id;
    console.log("==================================");

    let responseInvoice = await flowRequest("GET","/invoice/get",{
      invoiceId: invoiceId
    });

    console.log('Respuesta de creación de factura:', responseInvoice);
   

     res.json({
      success: true,
      message:
      'Suscripción creada, pero no se encontró una factura pendiente de pago.',
      subscriptionId,
      });

  } catch (error) {
    console.error('Error al crear la suscripción:', error);
    res.status(400).json({ error });
  }
});

module.exports = router;