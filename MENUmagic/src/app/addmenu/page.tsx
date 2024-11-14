'use client'
import "boxicons";
import React, { useState, useEffect } from "react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import Nav from "@/components/nav/nav"; // Import the Nav component
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { doc, setDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Timestamp } from "firebase/firestore";
import { onAuthStateChanged, getAuth, User } from "firebase/auth";
import { useRouter } from "next/navigation";

function Addmenu() {
  // State to manage the file, food name, and food type
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [foodName, setFoodName] = useState("");
  const [foodType, setFoodType] = useState("");
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [titleAlert, setTitleAlert] = useState("");
  const [contentAlert, setContentAlert] = useState("");
  const [userID, setUserID] = useState<String | null>("");
  const [user, setUser] = useState<User | null>(null); // Track the authenticated user
  const auth = getAuth();
  const route = useRouter();

  // Handle drag and drop events(
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      uploadFile(droppedFile);
    }
  };

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      uploadFile(selectedFile);
    }
  };
  
  // File upload function to Firebase Storage
  const uploadFile = (file: File) => {
    const fileType = file.type;
    const validExtensions = ["image/jpeg", "image/png", "image/gif"];
    if (validExtensions.includes(fileType)) {
      const storageRef = ref(storage, `images/${file.name}`); // สร้าง reference ไปยังที่เก็บไฟล์ใน Firebase

      const uploadTask = uploadBytesResumable(storageRef, file); // อัปโหลดไฟล์

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`การอัปโหลดเสร็จสิ้นแล้ว ${progress}%`);
        },
        (error) => {
          console.error("การอัปโหลดล้มเหลว:", error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            console.log("ไฟล์สามารถเข้าถึงได้ที่", downloadURL);
            setFilePreview(downloadURL); // เก็บ URL ของรูปเพื่อใช้แสดงผลหรือบันทึก
            setFile(file);
          });
        }
      );
    } else {
      setTitleAlert("กรุณาอัปโหลดไฟล์ภาพที่ถูกต้อง");
      setContentAlert("ไฟล์ที่อัปโหลดได้คือ JPEG, PNG, หรือ GIF");
      setIsAlertOpen(true);
    }
  };

  // Handle form submission
  const handleSave = async () => {
    if (!foodName || !foodType || !file) {
      setTitleAlert('กรุณากรอกข้อมูลให้ครบถ้วน');
      setContentAlert('คุณต้องกรอกชื่ออาหาร เลือกประเภทอาหาร และอัปโหลดรูปภาพก่อนบันทึกข้อมูล');
      setIsAlertOpen(true); // Trigger alert dialog if validation fails
      return;
    }
    
    try {
      // Use Firestore auto-generated ID instead of randomUUID
      const foodID = doc(collection(db, "menuTable")).id;

      // Add user to Firestore database
      await setDoc(doc(db, "menuTable", foodID), {
        userID: userID, // ต้องเทียบ userID
        foodImg: filePreview,
        foodName: foodName,
        category: foodType,
        createdAt: Timestamp.now(), // Include timestamp for when user is created
      });

      setFilePreview("");
      setFoodName("");
      setFoodType("");
    } catch (error) {
      console.log(error);
    }

    // Save or submit logic goes here
    console.log({
      name: foodName,
      type: foodType,
      image: filePreview,
    });
    setTitleAlert("บันทึกข้อมูลเรียบร้อยแล้ว!");
    setContentAlert("");
    setIsAlertOpen(true); // Trigger alert dialog if validation fails
    //route.push('/menupage')
  };

  // Handle form reset
  const handleCancel = () => {
    setFoodName("");
    setFoodType("");
    setFile(null);
    setFilePreview(null);
  };
  useEffect(() => {
    
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setUser(user); // User is logged in
          setUserID(localStorage.getItem("userID") || ""); // Safely retrieve userID
        } else {
          setUser(null); // No user is logged in
        }
      });
      // Cleanup subscription on unmount
      return () => unsubscribe();
    
  }, [auth]);
  
  

  return (
    <div className="container-addmenu">
      {/* Include Nav component */}
      <Nav />

      {/* ======= Drop-Image ======= */}
      <h2 className="addmenu-h2">เพิ่มเมนูที่ต้องการ</h2>
      <div className="dropimage-container">
        <div
          className="drag-area"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {filePreview ? (
            <img
              src={filePreview}
              alt="Uploaded"
              style={{ maxWidth: "100%", maxHeight: "300px" }}
            />
          ) : (
            <>
              <div className="icon">
                <i className="fas fa-cloud-upload-alt"></i>
              </div>
              <i className="bx bxs-cloud-upload"></i>
              <p>ลาก หรือวางเพื่ออัปโหลดรูปภาพ</p>
              <span>หรือ</span>
              <button
                onClick={() =>
                  document
                    .querySelector<HTMLInputElement>(".drag-area input")
                    ?.click()
                }
              >
                เลือกรูปภาพจากอุปกรณ์
              </button>
              <input type="file" hidden onChange={handleFileChange} />
            </>
          )}
        </div>
      </div>
      {/* End Drop-Image */}

      {/* ======= Food filter form ======= */}
      <div className="form-container">
        <div className="form-field">
          <label htmlFor="idNumber">ชื่ออาหาร:</label>
          <input
            type="text"
            id="idNumber"
            name="idNumber"
            placeholder="ชื่อเมนู..."
            value={foodName}
            onChange={(e) => setFoodName(e.target.value)}
          />
        </div>
        <div className="form-field">
          <label htmlFor="select">ประเภท:</label>
          <select
            className="select-form"
            id="select"
            name="foodType"
            value={foodType}
            onChange={(e) => setFoodType(e.target.value)}
          >
            <option value="">เลือกประเภทอาหาร</option>
            <option value="แกง">แกง</option>
            <option value="ทอด">ทอด</option>
            <option value="ยำ">ยำ</option>
            <option value="ผัด">ผัด</option>
            <option value="ของหวาน">ของหวาน</option>
          </select>
        </div>
      </div>
      {/* End Food filter form */}

      {/* ======= Button OK & Cancel ======= */}
      <div className="button-container login w-full">
        <button className="cancel m-2" onClick={handleCancel}>
          ยกเลิก
        </button>
        <button className="ok m-2" onClick={handleSave}>
          บันทึกข้อมูล
        </button>
      </div>
      {/* End Button OK & Cancel */}

      {/* AlertDialog for form validation */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{titleAlert}</AlertDialogTitle>
            <AlertDialogDescription>{contentAlert}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button
                className="text-black"
                onClick={() => setIsAlertOpen(false)}
              >
                ปิด
              </Button>
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default Addmenu;
