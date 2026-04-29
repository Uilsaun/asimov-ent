const express = require('express');
const router = express.Router();
const DemandeController = require('../controllers/DemandeController');

router.get('/',                      DemandeController.getAll);
router.post('/',                     DemandeController.soumettre);
router.put('/:id/approuver',         DemandeController.approuver);
router.put('/:id/refuser',           DemandeController.refuser);

module.exports = router;
