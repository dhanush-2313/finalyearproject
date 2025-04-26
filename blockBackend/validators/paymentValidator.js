const Joi = require('joi');

// Validation schema for creating a payment
exports.validatePayment = (data) => {
  const schema = Joi.object({
    amount: Joi.number().positive().required(),
    paymentMethod: Joi.string().valid('bank_transfer', 'credit_card', 'voucher').required(),
    projectId: Joi.string().hex().length(24).required(),
    description: Joi.string().max(500).optional(),
    metadata: Joi.object().optional()
  });

  return schema.validate(data);
};

// Validation schema for redeeming a voucher
exports.validateVoucherRedeem = (data) => {
  const schema = Joi.object({
    voucherCode: Joi.string().required(),
    projectId: Joi.string().hex().length(24).required()
  });

  return schema.validate(data);
};

module.exports = {
  validatePayment,
  validateVoucherRedeem
}; 