'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Nav from '@/components/nav/nav';
import { collection, query, where, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

function Randommenu() {
  const [userID, setUserID] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]); // เก็บข้อมูลเมนูทั้งหมด
  const [randomItem, setRandomItem] = useState<any | null>(null); // เก็บเมนูที่สุ่มได้
  const [showPopup, setShowPopup] = useState(false); // ควบคุมการแสดง popup
  const [showConfirmation, setShowConfirmation] = useState(false); // ควบคุมการแสดงยืนยันการสุ่ม
  const [selectedCategory, setSelectedCategory] = useState<string>(''); // เก็บประเภทที่เลือก
  const [activeCategory, setActiveCategory] = useState<string>(''); // เก็บประเภทที่ถูกกด
  const [previouslyRandomized, setPreviouslyRandomized] = useState<any[]>([]); // เก็บเมนูที่สุ่มแล้ว

  const categoryColors: { [key: string]: string } = {
    '': '#FF6F91',   // ปรับเป็นสีชมพูสดใส
    'แกง': '#7ED3E6', // ปรับเป็นสีฟ้าพาสเทล
    'ผัด': '#D5B6E4', // ปรับเป็นสีม่วงอ่อน
    'ยำ': '#A8E2C4',  // ปรับเป็นสีเขียวพาสเทล
    'ทอด': '#FBD5B0', // ปรับเป็นสีเหลืองพาสเทล
    'ของหวาน': '#FFB3BA', // ปรับเป็นสีชมพูอ่อน
  };

  const getMenuItems = async (userID: string | null) => {
    if (!userID) return;

    try {
      const usersRef = collection(db, 'menuTable');
      const q = query(usersRef, where('userID', '==', userID));
      const querySnapshot = await getDocs(q);

      let items = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setMenuItems(items); // เก็บข้อมูลใน state
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  useEffect(() => {
    const storedUserID = localStorage.getItem('userID');
    setUserID(storedUserID);

    if (storedUserID) {
      getMenuItems(storedUserID);
    }
  }, []);

  // ฟังก์ชันสุ่มและแสดงผลเมนู 1 รายการ
  const handleRandomClick = () => {
    // กรองเมนูตามประเภทที่เลือก
    const filteredItems = selectedCategory
      ? menuItems.filter(item => item.category === selectedCategory && !previouslyRandomized.includes(item.id))
      : menuItems.filter(item => !previouslyRandomized.includes(item.id)); // ถ้าไม่มีการเลือกประเภท ให้ใช้เมนูทั้งหมด

    // เพิ่มอนิเมชัน wiggle
    const machineImg = document.querySelector('.machine');
    if (machineImg) {
      machineImg.classList.add('wiggle');

      // ลบคลาส wiggle หลังจากอนิเมชันเสร็จสิ้น
      setTimeout(() => {
        machineImg.classList.remove('wiggle');
      }, 1000); // เวลาตรงกับความยาวของอนิเมชัน
    }

    if (filteredItems.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredItems.length); // สุ่ม index
      const selectedItem = filteredItems[randomIndex]; // เมนูที่ถูกสุ่ม

      setRandomItem(selectedItem); // เก็บเมนูที่สุ่มได้ใน state

      setTimeout(() => {
        setShowPopup(true); // แสดง Popup
        setShowConfirmation(true); // แสดงการยืนยันการสุ่ม
      }, 2000); // หน่วงเวลา 3 วินาที
    }
  };

  // ฟังก์ชันปิด Popup
  const closePopup = () => {
    setShowPopup(false); // ปิด Popup
    setShowConfirmation(false); // ปิดการยืนยันการสุ่ม
  };

  // ฟังก์ชันจัดการยืนยันการสุ่ม
  const confirmRandomization = async () => {
    if (randomItem && userID) {
      try {
        // เพิ่มข้อมูลเมนูที่สุ่มไปแล้วลงใน Firestore
        await addDoc(collection(db, 'randomTable'), {
          userID: userID,
          menuID: randomItem.id,
          foodName: randomItem.foodName,
          category: randomItem.category,
          timestamp: Timestamp.now(),
        });

        setPreviouslyRandomized(prev => [...prev, randomItem.id]);
        console.log("Random item saved successfully");
      } catch (error) {
        console.error("Error saving random item:", error);
      }
    }
    closePopup();
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category); // อัปเดตประเภทที่เลือก
    setActiveCategory(category); // อัปเดตปุ่มที่ถูกกด
  };

  return (
    <div className='body-random'>
      <Nav />
      <main>

        <section id="imgRandom">
          <img className="machine" src="/img/machine.png" alt="Random machine" />
          <img className="shine" src="https://assets.codepen.io/2509128/shine.png" alt="Shine machine" />
        </section>

        <section id="menuRandom">
          <div className="filter">
            <h1> ประเภทอาหาร </h1>

            <div className="container-of-menu-page1">
            <div className="line-of-menu-page1"></div>
            </div>

            <div className="filter-grid">
              {Object.keys(categoryColors).map((category) => (
                <button
                  key={category}
                  className={`category ${selectedCategory === category ? 'active' : ''}`}
                  style={{
                    backgroundColor: selectedCategory === category ? '#ff5733' : categoryColors[category],
                    color: selectedCategory === category ? 'white' : 'black', // เปลี่ยนสีข้อความเมื่อ active
                  }}
                  onClick={() => handleCategoryClick(category)}
                >
                  {category === '' ? 'ทุกประเภท' : category}
                </button>
              ))}
            </div>

          </div>
          <button id="randomBtn" onClick={handleRandomClick}><b>สุ่ม</b></button>
        </section>

        {showPopup && randomItem && (
          <div className="popup">
            <div className="popup-content">
              <span className="close-btn" onClick={closePopup}>&times;</span>
              <p className="food-title">{randomItem.foodName}</p>
              {randomItem.foodImg && (randomItem.foodImg.startsWith('http://') || randomItem.foodImg.startsWith('https://')) ? (
                <Image
                  src={randomItem.foodImg}
                  alt={randomItem.foodName}
                  width={300}
                  height={300}
                  style={{ display: 'block', margin: '0 auto' }} // จัดภาพให้อยู่ตรงกลาง
                />
              ) : (
                <p>No image available</p>
              )}

              {/* ยืนยันการสุ่ม */}
              {showConfirmation && (
                <div className="confirmation-dialog">
                  <p>คุณต้องการยืนยันการสุ่มนี้หรือไม่?</p>
                  <button className='confirmbtn' onClick={confirmRandomization}>ยืนยัน</button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Randommenu;
