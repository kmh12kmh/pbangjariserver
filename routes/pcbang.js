var express = require('express');
var router = express.Router();
var Pbang = require('../models/pcbang');
var Ceo = require('../models/ceo')

router.get('/allPbang', (req, res) => { //모든 피방 조회
  var selects = {
    "pcBangName": 1,
    "pcBangTel": 1,
    "pcBangAdress": 1,
    "ceoId.ceoId": 1
  }

  Pbang.find({}, selects, (err, ceos) => {
    if (err) res.status(404).end();
    else if (!ceos) res.status(403).json({
      message: "no ceo"
    });
    else res.status(200).json(ceos);
  });
});

router.post('/pcBang/create/:ceoId', (req, res) => { // 피방 생성
  var newPbang = new Pbang({
    "ceoId": req.params.ceoId,
    "pcBangName": req.body.pcBangName,
    "pcBangTel": req.body.pcBangTel,
    "pcBangAdress.postCode": req.body.postCode,
    "pcBangAdress.roadAddress": req.body.roadAddress,
    "pcBangAdress.detailAddress": req.body.detailAddress,
    "pcBangIPAddress.first": req.body.ipFirst,
    "pcBangIPAddress.second": req.body.ipSecond,
    "pcBangIPAddress.third": req.body.ipThird
  });

  Ceo.findById(req.params.ceoId, (err, findedCeo) => {
    if (err) res.status(404).end();
    else if (!findedCeo) res.status(403).json({
      message: "not CEO"
    })
    else {
      newPbang.save((err, pbang) => {
        if (err) res.status(404).end();
        else if (!pbang) res.status(403).json({
          message: "no pbang"
        });
        else res.status(201).json(pbang);
      });
    }
  })
});

router.get('/pcBang/load/:pcBangId', (req, res) => {
  var ceoSelects = "ceoId";
  var pbangSelects = "pcBangName pcBangTel pcBangAdress pcBangIPAddress";

  Pbang.findOne({
    "_id": req.params.pcBangId
  }, pbangSelects).populate("ceoId", ceoSelects).exec((err, pbang) => {
    if (err) res.status(404).end();
    else if (!pbang) res.status(404).json({
      message: "no pbang"
    });
    else res.status(200).json(pbang)
  })
});

router.delete('/pcBang/delete/:pcBangId', (req, res) => { // 피방 삭제
  Pbang.findByIdAndRemove(req.params.pcBangId, (err) => {
    if (err) res.status(404).end();
    else Ceo.update({
      "pcBang._id": req.params.pcBangId
    }, {
      $pull: {
        "pcBang": req.params.pcBangId
      }
    }, (err) => {
      if (err) res.status(404).end();
      else res.status(200).json({
        message: "delete sucess"
      });
    })
  })
});

module.exports = router;
