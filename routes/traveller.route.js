//ไฟล์ที่ใช้ในการจักการเส้นทางในการเรียกใช้งาน service/api
const travellerCtrl = require('./../controllers/traveller.controller.js');

//เรียกใช้งาน express เพื่อใช้งาน router ในการจัดการเส้นทางเพื่อเรียกใช้งาน service/api
const express = require('express');
const router = express.Router();

//ในการกำหนดเส้นทางเป็นไปตามหลักการของ REST API
//เพิ่ม post, แก้ไข put, ลบ delete, ค้นหา ตรวจสอบ ดึงดู get

router.post("/", travellerCtrl.uploadTraveller, travellerCtrl.createTraveller);

router.get("/:travellerEmail/:travellerPassword", travellerCtrl.checkLoginTraveller);

router.put("/:travellerId",travellerCtrl.uploadTraveller, travellerCtrl.editTraveller);

router.delete("/:travellerId", travellerCtrl.deleteTraveller);

//export router ออกไปใช้งาน
module.exports = router;