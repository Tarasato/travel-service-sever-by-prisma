//File that writes control operations for a table in the database
//เช่น insert, update, delete, select
//This file works with traveller_tb\
const multer = require("multer");
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

const storage = new CloudinaryStorage({
  cloudinary: Cloudinary,
  params: async (req, file) => {
    const newFile = 'traveller_' + Math.floor(Math.random() * Date.now());
    return {
      folder: "images/traveller",
      allowed_formats: ["jpg", "png", "jpeg"],
      public_id: newFile,
    }
  },
})


//Traveller Image upload function
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "images/traveller");
//   },
//   filename: function (req, file, cb) {
//     cb(
//       null,
//       "traveller_" +
//         Math.floor(Math.random() * Date.now()) +
//         path.extname(file.originalname)
//     );
//   },
// });

//register traveller
exports.createTraveller = async (req, res) => {
  try {
    const result = await prisma.traveller_tb.create({
      data: {
        travellerFullname: req.body.travellerFullname,
        travellerEmail: req.body.travellerEmail,
        travellerPassword: req.body.travellerPassword,
        travellerImage: req.file
          ? req.file.path.replace("images\\traveller\\", "")
          : "",
      },
    });
    res.status(201).json({
      message: "Traveller created successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

//func check login in traveller_tb
exports.checkLoginTraveller = async (req, res) => {
  try {
    const result = await prisma.traveller_tb.findFirst({
      where: {
        travellerEmail: req.params.travellerEmail,
        travellerPassword: req.params.travellerPassword,
      },
    });

    if (result) {
      res.status(200).json({
        message: "Traveller login succesfully",
        data: result,
      });
    } else {
      res.status(404).json({
        message: "Traveller login failed",
        data: result,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

//func edit profile user in traveller_tb
exports.editTraveller = async (req, res) => {
  try {
    let result = {};
    //---------------------------------------------
    if (req.file) {
      //ค้นดูว่ามีรูปไหม ถ้ามีให้ลบรูปเก่าออก
      let result = await prisma.traveller_tb.findFirst({
        where: {
          travellerId: Number(req.params.travellerId),
        },
      });
      //ตตรวจสอบว่ามีรูปไหม
      if (result.travellerImage) {
        const traveller = result.travellerImage.split("/").pop().split(".")[0]; // Extract public_id from URL
        await Cloudinary.uploader.destroy(`images/traveller/${traveller}`);
      }
      // if (traveller.travellerImage) {
      //   //ลบรูปเก่าออก
      //   fs.unlink(traveller.travellerImage, (err) => {
      //     console.log(err);
      //   });
      // }

      //แก้ไขข้อมูล
      result = await prisma.traveller_tb.update({
        where: {
          travellerId: Number(req.params.travellerId),
        },
        data: {
          travellerFullname: req.body.travellerFullname,
          travellerEmail: req.body.travellerEmail,
          travellerPassword: req.body.travellerPassword,
          travellerImage: req.file.path,
        },
      });
    } else {
      //แก้ไขข้อมูล
      result = await prisma.traveller_tb.update({
        where: {
          travellerId: Number(req.params.travellerId),
        },
        data: {
          travellerFullname: req.body.travellerFullname,
          travellerEmail: req.body.travellerEmail,
          travellerPassword: req.body.travellerPassword,
        },
      });
    }

    //---------------------------------------------
    res.status(200).json({ message: "Edit successfully!", data: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//ฟังก์ชันลบข้อมูลผู้ใช้งานใน traveller_tb
exports.deleteTraveller = async (req, res) => {
  try {
    const traveller = await prisma.traveller_tb.findFirst({
      where: {
        travellerId: Number(req.params.travellerId),
      },
    });
    if (traveller.travellerImage) {
      const publicId = traveller.travellerImage.split("/").pop().split(".")[0]; // Extract public_id from URL
      await Cloudinary.uploader.destroy(`images/traveller/${publicId}`);
    }

    const result = await prisma.traveller_tb.delete({
      where: {
        travellerId: Number(req.params.travellerId),
      },
    });
    res.status(200).json({
      message: "Traveller deeleted successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.uploadTraveller = multer({
  storage: storage,
  limits: {
    fileSize: 1000000,
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
}).single("travellerImage");
