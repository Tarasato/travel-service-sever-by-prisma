//File that writes control operations for a table in the database
//เช่น insert, update, delete, select
//This file works with travel_tb

//ใช้งาน Cloudinary ในการอัพโหลดรูปภาพ
const { v2: Cloudinary } = require('cloudinary')
const { CloudinaryStorage } = require('multer-storage-cloudinary')
// Configurations
Cloudinary.config({
  cloud_name: 'dpux0kfvu',
  api_key: '488942715825326',
  api_secret: '719UZFKNly19r4Bza2HK50CwyiI' // Click 'View API Keys' above to copy your API secret
});

//ใช้ Prisma ในการเชื่อมต่อฐานข้อมูล CRUD
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const path = require("path");
const fs = require("fs");
const multer = require("multer");

const storage = new CloudinaryStorage({
  cloudinary: Cloudinary,
  params: async (req, file) => {
    const newFile = 'travel_' + Math.floor(Math.random() * Date.now());
    return {
      folder: "images/travel",
      allowed_formats: ["jpg", "png", "jpeg"],
      public_id: newFile,
    }
  },
})

//fuction insert data to travel_tb
exports.createTravel = async (req, res) => {
  try {
    //ตัวแปร
    let data = {
      ...req.body,
      //เช็คว่ามีไฟล์รูปภาพหรือไม่
      travelImage: req.file
        ? req.file.path.replace("images\\travel\\", "")
        : "",
    };

    const result = await prisma.travel_tb.create(
      {
        data: {
          travellerId: Number(req.body.travellerId),
          travelPlace: req.body.travelPlace,
          travelStartDate: req.body.travelStartDate,
          travelEndDate: req.body.travelEndDate,
          travelCostTotal: parseFloat(req.body.travelCostTotal),
          travelImage: req.file
            ? req.file.path.replace("images\\travel\\", "")
            : "",
        }
      }
    );

    res.status(201).json({
      message: "Travel created successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

//func get all travel in travel_tb
exports.getAllTravel = async (req, res) => {
  try {
    const result = await prisma.travel_tb.findMany({
      where: {
        travellerId: Number(req.params.travellerId),
      },
    });
    if (result) {
      res.status(200).json({
        message: "Travel get successfully",
        data: result,
      });
    } else {
      res.status(404).json({
        message: "Travel get failed",
        data: result,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

//func get travel by travelId in travel_tb
exports.getTravel = async (req, res) => {
  try {
    const result = await prisma.travel_tb.findFirst({
      where: {
        travelId: Number(req.params.travelId),
      },
    });
    if (result) {
      res.status(200).json({
        message: "Travel get successfully",
        data: result,
      });
    } else {
      res.status(404).json({
        message: "Travel get failed",
        data: result,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

//func edit travel in travel_tb
exports.editTravel = async (req, res) => {
  try {
    const travel = await prisma.travel_tb.findFirst({
      where: { travelId: Number(req.params.travelId) },
    });

    if (!travel) {
      return res.status(404).json({ message: "ไม่พบข้อมูลที่ต้องการแก้ไข" });
    }

    let updatedData = {
      travellerId: Number(req.body.travellerId),
      travelPlace: req.body.travelPlace,
      travelStartDate: req.body.travelStartDate,
      travelEndDate: req.body.travelEndDate,
      travelCostTotal: parseFloat(req.body.travelCostTotal),
    };

    // ถ้ามีรูปใหม่ ให้ลบรูปเก่าออกจาก Cloudinary
    if (req.file) {
      if (travel.travelImage) {
        const publicId = travel.travelImage.split("/").pop().split(".")[0]; // ดึง public_id ออกจาก URL
        await Cloudinary.uploader.destroy(`images/travel/${publicId}`);
      }
      updatedData.travelImage = req.file.path;
    }

    const result = await prisma.travel_tb.update({
      where: { travelId: Number(req.params.travelId) },
      data: updatedData,
    });

    res.status(200).json({
      message: "อัปเดตข้อมูลสำเร็จ",
      data: result,
    });
  } catch (error) {
    res.status(500).json({ message: "เกิดข้อผิดพลาด: " + error.message });
  }
};

//func delete travel in travel_tb
exports.deleteTravel = async (req, res) => {
  try {
    const travel = await prisma.travel_tb.findFirst({
      where: {
        travelId: Number(req.params.travelId),
      },
    });
    if (travel.travelImage) {
      const publicId = travel.travelImage.split("/").pop().split(".")[0]; // Extract public_id from URL
      await Cloudinary.uploader.destroy(`images/travel/${publicId}`);
    }

    const result = await prisma.travel_tb.delete({
      where: {
        travelId: Number(req.params.travelId),
      },
    });
    res.status(200).json({
      message: "Travel deeleted successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

//Travel Image upload function
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "images/travel");
//   },
//   filename: function (req, file, cb) {
//     cb(
//       null,
//       "travel_" +
//         Math.floor(Math.random() * Date.now()) +
//         path.extname(file.originalname)
//     );
//   },
// });

exports.uploadTravel = multer({
  storage: storage,
  limits: {
    // กำหนดขนาดไฟล์สูงสุดที่จะรับ 10MB
    fileSize: 10000000,
  },
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const mimetype = fileTypes.test(file.mimetype);
    const extname = fileTypes.test(path.extname(file.originalname));
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb("Error: Images Only!");
  },
}).single("travelImage");
