"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import Nav from "@/components/nav/nav";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useState, useEffect } from "react";
import { useFormState } from "react-dom";

function Menupage() {
  const [userID, setUserID] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]); // State to store fetched data
  const [searchTerm, setSearchTerm] = useState<string>(""); // State for search term
  const [selectedCategory, setSelectedCategory] = useState<string>(""); // State for selected category
  const [showDeletePopup, setShowDeletePopup] = useState(false); // State for delete confirmation popup
  const [itemToDelete, setItemToDelete] = useState<any | null>(null); // State to hold item to delete

  // กำหนดสีสำหรับประเภทเมนู
  const categoryColors: { [key: string]: string } = {
    "": "#FF86B4", // ทุกประเภท
    แกง: "#B6E4EB",
    ผัด: "#CBBBD6",
    ยำ: "#C5DBC4",
    ทอด: "#FBD5B0",
    ของหวาน: "#FEC8C3",
  };
 
  const getMenuItems = async (userID: string | null) => {
    console.log("userID", userID);
    if (!userID) return;

    try {
      const usersRef = collection(db, "menuTable");
      const q = query(usersRef, where("userID", "==", userID));
      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("Items", items);
      setMenuItems(items); // Store the fetched data in state
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };
  useEffect(() => {
    // Get the userID from localStorage when the component mounts
    const storedUserID = localStorage.getItem("userID");
    setUserID(storedUserID);

    // Fetch data from Firestore if userID is found
    if (storedUserID) {
      console.log("storagd", storedUserID);
      getMenuItems(storedUserID);
    }
  }, []); // Empty dependency array means this runs once when the component mounts

  // ฟังก์ชันสำหรับจัดการการค้นหา
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // ฟังก์ชันสำหรับกรองข้อมูลที่จะแสดงตามคำค้นหาและประเภทที่เลือก
  const filteredMenuItems = menuItems.filter((item) => {
    const matchesSearch = item.foodName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory
      ? item.category === selectedCategory
      : true;
    return matchesSearch && matchesCategory;
  });

  // ฟังก์ชันสำหรับจัดการการกดปุ่มประเภท
  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
  };

  const handleDeleteClick = (item: any) => {
    setItemToDelete(item); // Set the item to delete
    setShowDeletePopup(true); // Show the delete confirmation popup
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      try {
        await deleteDoc(doc(db, "menuTable", itemToDelete.id)); // Delete item from Firestore
        setMenuItems((prevItems) =>
          prevItems.filter((item) => item.id !== itemToDelete.id)
        ); // Remove item from state
        setShowDeletePopup(false); // Close the popup
        setItemToDelete(null); // Clear the item to delete
      } catch (error) {
        console.error("Error deleting item: ", error);
      }
    }
  };

  const openYouTubeSearch = (foodName: string) => {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(foodName)}`;
    window.open(url, '_blank'); // เปิดลิงก์ในแท็บใหม่
  };

  return (
    <div className="body-menu">
    <div>
      {/* เรียกใช้ Nav */}
      <Nav />

      <div id="her2">
        {/* ส่วนหัวของหน้า ประกอบไปด้วย filter, search, addMenu */}
        <h1 className="type-of-menu-page"> ประเภทอาหาร </h1>
        <div className="container-of-menu-page">
          <div className="line-of-menu-page"></div>
        </div>

        <div className="layout-container">
          <div className="parent-container">
            <div className="filter-grid2">
              {Object.keys(categoryColors).map((category) => (
                <button
                  key={category}
                  className={`category2 ${
                    selectedCategory === category ? "active" : ""
                  }`}
                  style={{
                    backgroundColor:
                      selectedCategory === category
                        ? "#ff5733"
                        : categoryColors[category],
                    color: selectedCategory === category ? "white" : "black", // เปลี่ยนสีข้อความเมื่อ active
                  }}
                  onClick={() => handleCategoryClick(category)}
                >
                  {category === "" ? "ทุกประเภท" : category}
                </button>
              ))}
            </div>
          </div>

          {/* ช่องค้นหา */}
          <div className="form-container2">
            <input
              className="form-search2"
              type="search"
              placeholder="ค้นหาเมนู"
              aria-label="Search"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <Link href="/addmenu">
              <button id="addMenu2">
                <b>เพิ่มเมนู</b>
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* แสดงการ์ดของ menuItems ที่ถูกกรอง */}
      {filteredMenuItems.length > 0 ? (
        <div className="card-container">
          {filteredMenuItems.map((item) => (
            <div
              key={item.id}
              className="card"
              style={{ backgroundColor: categoryColors[item.category] || '#FFEDD5' }}
              onClick={() => openYouTubeSearch(item.foodName)} // เพิ่ม onClick เพื่อเปิดลิงก์ YouTube
            >
              <span className="delete-btn" onClick={(e) => { e.stopPropagation(); handleDeleteClick(item); }}>&times;</span>
              <h3 className="card-title">{item.foodName}</h3>
              <p className="card-category">{item.category}</p>
              {item.foodImg && (item.foodImg.startsWith('http://') || item.foodImg.startsWith('https://')) ? (
                <Image
                  src={item.foodImg}
                  alt={item.foodName}
                  width={200}
                  height={200}
                  style={{ display: "block", margin: "0 auto" }}
                  className="card-img"
                />
              ) : (
                <p>No image available</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="notify-page-menu">ไม่พบรายการเมนูสำหรับผู้ใช้รายนี้</p>
      )}

      {/* Delete Confirmation Popup */}
      {showDeletePopup && (
        <div className="popup">
          <div className="popup-content">
            <h2>คุณต้องการที่จะลบเมนูนี้ ใช่ไหม?</h2>
            <button onClick={() => setShowDeletePopup(false)}>ยกเลิก</button>
            <button onClick={confirmDelete}>ยืนยัน</button>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}

export default Menupage;
