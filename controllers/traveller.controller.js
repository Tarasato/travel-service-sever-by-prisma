//File that writes control operations for a table in the database
//เช่น insert, update, delete, select
//This file works with traveller_tb\

//ใช้ Prisma ในการเชื่อมต่อฐานข้อมูล CRUD
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const multer = require("multer");
const path = require("path");
const fs = require("fs");

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
    //ตรวจสอบว่ามีการอัพโหลดรูปภาพหรือไม่
    //กรณีที่มี ตรวจสอบก่อนว่ามีไฟล์เก่าไหม ถ้ามีให้ลบไฟล์เก่าออก
    if (req.file) {
      const traveller = await prisma.traveller_tb.findFirst({
        where: {
          travellerId: Number(req.params.travellerId),
        },
      });
      //ถ้ามีไฟล์เก่าให้ลบออก
      if (traveller.travellerImage) {
        fs.unlinkSync("images/traveller/" + traveller.travellerImage, (err) => {
          console.log(err);
        });
      }

      result = await prisma.traveller_tb.update({
        where: {
          travellerId: Number(req.params.travellerId),
        },
        data: {
          travellerFullname: req.body.travellerFullname,
          travellerEmail: req.body.travellerEmail,
          travellerPassword: req.body.travellerPassword,
          travellerImage: req.file.path.replace("images\\traveller\\", ""),
        },
      });
    } else {
      //กรณีไม่มีการอัพโหลดรูป
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

    res.status(200).json({
      message: "Traveller updated successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
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
          const oldImagePath = "images/traveller/" + traveller.travellerImage;
          //ลบไฟล์เก่าออก
          fs.unlinkSync(oldImagePath, (err) => {
            console.log(err);
          });
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

//Traveller Image upload function
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "images/traveller");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      "traveller_" +
        Math.floor(Math.random() * Date.now()) +
        path.extname(file.originalname)
    );
  },
});

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
