"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ModeToggle } from "@/components/switchmode";
import { signOut, getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { usePathname, useRouter } from 'next/navigation';
import { db, auth } from '@/lib/firebase';
import { collection, doc, getDocs, query, where, getDoc, orderBy, limit } from 'firebase/firestore';

interface MenuItem {
  id: string;
  foodName?: string;
  createdAt?: {
    seconds: number;
    nanoseconds: number;
  };
  category?: string; // Include other properties as necessary
  foodImg?: string;
  userID: string;
}


function Nav() {
  const [isSideNavOpen, setIsSideNavOpen] = useState<boolean>(false); // Track the Side Navigation visibility
  const [profileImage, setProfileImage] = useState<string>(""); // Track the random profile image
  const auth = getAuth();
  const [userID, setUserID] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null); // Track Firestore user data
  const [randomHistory, setRandomHistory] = useState<any[]>([]); // State to store random history
  const [menuHistory, setMenuHistory] = useState<MenuItem[]>([]); // State to store menu history
  const router = useRouter();
  const pathname = usePathname();

  // Array of profile images
  const profileImages = [
    "/img/profile1.png",
    "/img/profile2.png",
    "/img/profile3.png",
    "/img/profile4.png",
    "/img/profile5.png",
  ];
  // Track authentication state

  const fetchUserData = async (documentId: string) => {
    try {
      const docRef = doc(db, 'users', documentId); // อ้างอิง document ด้วย document ID
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setUserData(docSnap.data()); // บันทึกข้อมูลเอกสารใน state
        console.log("User data:", docSnap.data());
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchRandomTable = async (userID: string | null) => {
    try {
      const response = await fetch(`/api/history/random?userID=${userID}`);
      if (!response.ok) {
        throw new Error('Failed to fetch menu history');
      }
      const data = await response.json();
      setRandomHistory(data); // Assuming you have setMenuHistory from useState
      console.log(data)
    } catch (error) {
      console.error('Error fetching menu history:', error);
    }
  };

  const fetchMenuHistory = async (userID: String) => {
    try {
      const response = await fetch(`/api/history/menu?userID=${userID}`);
      if (!response.ok) {
        throw new Error('Failed to fetch menu history');
      }
      const data = await response.json();
      setMenuHistory(data); // Assuming you have setMenuHistory from useState
      console.log(data)
    } catch (error) {
      console.error('Error fetching menu history:', error);
    }
  };
  

  useEffect(() => {
    const storedUserID = localStorage.getItem('userID');
    setUserID(storedUserID);
    console.log(storedUserID)
    if (storedUserID) {
      fetchUserData(storedUserID);
      fetchRandomTable(storedUserID);
      fetchMenuHistory(storedUserID);
    }
  }, []);

  // Randomly select a profile image on component mount
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * profileImages.length);
    setProfileImage(profileImages[randomIndex]);
  }, []); // This will only run once on component mount

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUserData(null); // Reset user data
      localStorage.setItem("userID", "");
      setIsSideNavOpen(false); // Close Side Navigation on logout
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const toggleSideNav = () => {
    setIsSideNavOpen(!isSideNavOpen);
  };

  return (
    <div>
      {/* ======= Navbar ======= */}
      <div className="navbar-header">
        <Link href="/randommenu">
          <Image
            className="logo"
            src="/img/logoMenumagic.png"
            width={180}
            height={50}
            alt="logo"
          />
        </Link>

        <nav className="navbar-main">
          <ul>
            <li>
              <Link
                href="/randommenu"
                className={pathname === "/randommenu" ? "active" : ""}
              >
                สุ่มอาหาร
              </Link>
            </li>
            <li>
              <Link
                href="/menupage"
                className={
                  pathname === "/menupage" || pathname === "/addmenu"
                    ? "active"
                    : ""
                }
              >
                เมนูอาหาร
              </Link>
            </li>
          </ul>
        </nav>

        {userData ? (
          <div className="profile-avatar" onClick={toggleSideNav}>
            <Image
              src={profileImage}
              width={100}
              height={100}
              alt="Profile Avatar"
            />
          </div>
        ) : (
          <Link className="login text-primary-foreground" href="/login">
            <button>เข้าสู่ระบบ</button>
          </Link>
        )}

        {/* Side Navigation */}
        <div className={`side-nav ${isSideNavOpen ? "open" : ""}`}>
          <button className="close-btn" onClick={toggleSideNav}>
            &times;
          </button>
          <div className="side-nav-content">
            <h2>{userData?.name || 'Username'}</h2>
            <div className="separator"></div>
            <p className='flex flex-row'><span><svg className='mt-1 mr-3' xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960" width="30px" fill="#5f6368"><path d="M640-260q25 0 42.5-17.5T700-320q0-25-17.5-42.5T640-380q-25 0-42.5 17.5T580-320q0 25 17.5 42.5T640-260ZM480-420q25 0 42.5-17.5T540-480q0-25-17.5-42.5T480-540q-25 0-42.5 17.5T420-480q0 25 17.5 42.5T480-420ZM320-580q25 0 42.5-17.5T380-640q0-25-17.5-42.5T320-700q-25 0-42.5 17.5T260-640q0 25 17.5 42.5T320-580ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0-560v560-560Z"/></svg></span>ประวัติการสุ่ม</p>
            <div className='history'>
              {randomHistory.length > 0 ? (
                randomHistory.map((item, index) => (
                  <div className='list-item' key={item.id}>
                    <p>
                      {item.foodName || `ประวัติการสุ่ม ${index + 1}`}
                    </p> 

                    <p>
                      {item.timestamp ?
                        new Date(item.timestamp.seconds * 1000 + Math.floor(item.timestamp.nanoseconds / 1000000)).toLocaleString()
                        : `วันที่และเวลา ${index + 1}`}
                    </p>
                  </div>
                ))
              ) : (
                <p>ไม่มีประวัติการสุ่ม</p>
              )}
            </div>

            <div className="separator"></div>
            <p className='flex flex-row'><span><svg className='mt-1 mr-3' xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 -960 960 960" width="30px" fill="#5f6368"><path d="M680-80v-120H560v-80h120v-120h80v120h120v80H760v120h-80Zm-480-80q-33 0-56.5-23.5T120-240v-480q0-33 23.5-56.5T200-800h40v-80h80v80h240v-80h80v80h40q33 0 56.5 23.5T760-720v244q-20-3-40-3t-40 3v-84H200v320h280q0 20 3 40t11 40H200Zm0-480h480v-80H200v80Zm0 0v-80 80Z"/></svg></span>ประวัติการเพิ่มข้อมูล</p>
            <div className='history'>
              {menuHistory.length > 0 ? (
                menuHistory.map((item, index) => (
                  <div className='list-item' key={`${item.id}`}>
                    <p>{item.foodName || `Menu Item ${index + 1}`}</p>
                    <p>
                      {item.createdAt ?
                        new Date(item.createdAt.seconds * 1000 + Math.floor(item.createdAt.nanoseconds / 1000000)).toLocaleString()
                        : `วันที่และเวลา ${index + 1}`}
                    </p>
                  </div>
                ))
              ) : (
                <p>ไม่มีประวัติการเพิ่มข้อมูล</p>
              )}
            </div>
            <div className="separator"></div>
            <button className="logout-button" onClick={handleLogout}>
              ออกจากระบบ
            </button>
          </div>
        </div>
        {/* ======= End Navbar ======= */}
      </div>
      {/* <!-- End Navbar --> */}
    </div>
  );
}

export default Nav;
