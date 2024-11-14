'use client'; // This enables client-side rendering

import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore'; // Import Firestore functions
import { db, auth } from '@/lib/firebase'; // Ensure 'db' is initialized from your Firebase config
import { getRedirectResult, onAuthStateChanged, User } from 'firebase/auth'; // Import User type
import Nav from '@/components/nav/nav';
import Addmenu from '@/app/addmenu/page';
import { useRouter } from 'next/navigation';
import Randommenu from './randommenu/page';

export default function Home() {
  const [user, setUser] = useState<User | null>(null); // Track the authenticated user
  const [users, setUsers] = useState<any[]>([]); // Store users from Firestore
  const router = useRouter();
  const [userID, setUserID] = useState<String | null>('');
  // Track authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // console.log(currentUser);
    });
    const id = localStorage.getItem("userID")
    console.log("id", id)
    setUserID(id)
    return () => unsubscribe(); // Cleanup the listener on unmount
  }, []);

  // Function to load users from Firestore
  const loadTestUsers = async () => {
    try {
      const usersCollection = await getDocs(collection(db, 'users'));
      const usersList = usersCollection.docs.map(doc => doc.data());

      setUsers(usersList);
      console.log(usersList);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  return (
    <div>
      <Randommenu />
    </div>
  );

  // return (
  //   <div>
  //     <Nav />
  //     <Addmenu />

  //     {/* Display user info if logged in */}
  //     {user ? (
  //       <div>
  //         <p>Welcome, {user.email}</p>
  //         <button onClick={loadTestUsers}>Load Users</button>
  //         {users.length > 0 && (
  //           <ul>
  //             {users.map((userData, index) => (
  //               <li key={index}>{userData.email} - {userData.name}</li>
  //             ))}
  //           </ul>
  //         )}
  //       </div>
  //     ) : (
  //       <p>Please log in to load users.</p>
  //     )}
  //   </div>
  // );
}
