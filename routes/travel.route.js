//ไฟล์ที่ใช้ในการจักการเส้นทางในการเรียกใช้งาน service/api
const travelCtrl = require('./../controllers/travel.controller.js');

//เรียกใช้งาน express เพื่อใช้งาน router ในการจัดการเส้นทางเพื่อเรียกใช้งาน service/api
const express = require('express');
const router = express.Router();

//ในการกำหนดเส้นทางเป็นไปตามหลักการของ REST API
//เพิ่ม post, แก้ไข put, ลบ delete, ค้นหา ตรวจสอบ ดึงดู get

router.post("/", travelCtrl.uploadTravel, travelCtrl.createTravel);

router.get("/:travellerId", travelCtrl.getAllTravel);

router.get("/one/:travelId", travelCtrl.getTravel);

router.put("/:travelId", travelCtrl.uploadTravel, travelCtrl.editTravel);

router.delete("/:travelId", travelCtrl.deleteTravel);

//export router ออกไปใช้งาน
module.exports = router;