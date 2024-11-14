'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { Timestamp } from 'firebase/firestore';
import { signOut, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import Link from 'next/link';

function Nav2() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [conPassword, setConPassword] = useState('');
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [messageError, setMessageError] = useState('');

  // Function to create a new user
  const createUser = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevents page refresh on form submission

    // Check if password and confirm password match
    if (password !== conPassword) {
      console.log('Passwords do not match!');
      setMessageError('Passwords do not match!');
      setIsAlertOpen(true);
      return;
    }

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log(user);

      // Use Firestore auto-generated ID instead of randomUUID
      const userId = doc(collection(db, 'users')).id;

      // Add user to Firestore database
      await setDoc(doc(db, 'users', userId), {
        email: email,
        name: name,
        createdAt: Timestamp.now(), // Include timestamp for when user is created
      });

      // Clear form inputs
      setEmail('');
      setName('');
      setPassword('');
      setConPassword('');

      console.log('User registered successfully');
    } catch (error) {
      console.log('Error registering user', error);
      setIsAlertOpen(true);

      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes('auth/email-already-in-use')) {
          setMessageError('This email is already in use. Please use another email.');
        } else if (error.message.includes('auth/weak-password')) {
          setMessageError('The password is too weak. Please choose a stronger password.');
        } else {
          setMessageError(`Registration failed: ${error.message}`);
        }
      } else {
        setMessageError('An unexpected error occurred.');
      }
    }
  };

  // Function to handle user logout
  const logout = async () => {
    await signOut(auth);
    localStorage.setItem("userID", "")
    console.log("Logged out");
  };

  return (
    <div>
      {/* Navbar
      <header>
        <Image className="logo" src="/img/logoMenumagic.png" width={180} height={50} alt="logo" />
        <div className="nav-container">
          <Link href="/login" className='login'><button>เข้าสู่ระบบ</button></Link>
          <Link href="/register" className='login'><button>ลงทะเบียน</button></Link>
          <button onClick={logout} className="login">ออกจากระบบ</button>
        </div>
      </header>  */}

      {/* Register form */}
      <div className="form-wrapper">
        <div className="register-container">
          <div className="register-form">
            <Link href={'/'}>
              <Image className="logo-login" width={180} height={50} src="/img/logoMenumagic.png" alt="logo" />
            </Link>
            <form onSubmit={createUser}>
              <button type="button" id="google-login">เข้าสู่ระบบด้วย Google</button>
              <div className="divider-container">
                <div className="line"></div>
                <span className="text">หรือ</span>
                <div className="line"></div>
              </div>
              <input onChange={(e) => setName(e.target.value)} type="text2" placeholder="ชื่อผู้ใช้งาน" value={name} required />
              <input onChange={(e) => setPassword(e.target.value)} type="password" placeholder="รหัสผ่าน" value={password} required />
              <input onChange={(e) => setConPassword(e.target.value)} type="password" placeholder="ยืนยันรหัสผ่าน" value={conPassword} required />
              <input onChange={(e) => setEmail(e.target.value)} type="email" placeholder="อีเมล" value={email} required />
              <button type="submit">ลงทะเบียน</button>
            </form>
          </div>
        </div>

        <div className="login-container">
          <div className="login">
            <span className="text-login">มีบัญชีอยู่แล้ว? <Link href="/login">เข้าสู่ระบบ</Link></span>
          </div>
        </div>
      </div>

      {/* Alert Dialog */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>สมัครใช้งานไม่สำเร็จ</AlertDialogTitle>
            <AlertDialogDescription>
              {messageError}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button onClick={() => setIsAlertOpen(false)}>ปิด</Button>
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default Nav2;
