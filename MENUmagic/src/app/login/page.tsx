'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from "next/link";
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getDocs, collection, doc, query, where } from 'firebase/firestore';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

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
import { cookies } from 'next/headers';
import { db } from '@/lib/firebase';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [messageError, setMessageError] = useState('');
  const [isLoginButtonActive, setIsLoginButtonActive] = useState(false);
  const router = useRouter();

  // ใช้ useEffect เพื่อตรวจสอบ URL และเปลี่ยนสีของปุ่ม login
  useEffect(() => {
    if (window.location.pathname === '/login') {
      setIsLoginButtonActive(true);
    }
  }, []);

  const login = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent form from submitting in the traditional way

    try {
      const ret = await signInWithEmailAndPassword(auth, email, password);
      console.log("user log in ", ret.user);
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        console.log(doc.id, " => ", doc.data());
        localStorage.setItem("userID", doc.id.toString())
      });
      // console.log("querySnapshot", querySnapshot)
      //localStorage.setItem("user", ret.user.email);

      // cookies().set(ret)
      setEmail('');
      setPassword('');
      router.push('/'); // Redirect to homepage after login
    } catch (error) {
      setIsAlertOpen(true);
      if (error instanceof Error) {
        if (error.message.includes('auth/user-not-found')) {
          setMessageError('No user found with this email.');
        } else if (error.message.includes('auth/wrong-password')) {
          setMessageError('Incorrect password. Please try again.');
        } else {
          setMessageError('Failed to log in. Please try again.');
        }
      } else {
        setMessageError('An unexpected error occurred.');
      }
    }
  };

  return (
    <div className='body-login'>
      <header>
        <Link href="/randommenu">
          <Image className="logo" src="/img/logoMenumagic.png" width={180} height={50} alt="logo" />
        </Link>
        <div className="nav-container">
          <Link href="/login">
            <button
              className='login'
              onClick={() => setIsLoginButtonActive(true)}
              style={{ backgroundColor: isLoginButtonActive ? '#C4F8FF' : 'transparent' }}
            >
              เข้าสู่ระบบ
            </button>
          </Link>
          <Link href="/register" className='register'><button>ลงทะเบียน</button></Link>
        </div>
      </header> {/* End Navbar */}

      {/* Login Form */}
      <div className="form-wrapper">
        <div className="login-container">
          <div className="login-form">
            <Image className="logo-login" width={180} height={50} src="/img/logoMenumagic.png" alt="logo" />
            <form onSubmit={login}>
              <input
                onChange={(e) => setEmail(e.target.value)}
                type="text1"
                placeholder="หมายเลขโทรศัพท์ หรืออีเมล"
                value={email}
                required
              />
              <input
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="รหัสผ่าน"
                value={password}
                required
              />
              <button type="submit">เข้าสู่ระบบ</button>
              <div className="divider-container">
                <div className="line"></div>
                <span className="text1">หรือ</span>
                <div className="line"></div>
              </div>
              <button type="button" id="google-login">เข้าสู่ระบบด้วย Google</button>
            </form>
            <p className="change-password">ลืมรหัสผ่านหรือไม่?</p>
          </div>
        </div>

        <div className="register-container">
          <span className="text-register">หากยังไม่มีบัญชี <a href="/register">ลงทะเบียน</a></span>
        </div>
      </div>

      {/* Alert Dialog */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>เข้าสู่ระบบไม่สำเร็จ</AlertDialogTitle>
            <AlertDialogDescription>
              {messageError}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button className='text-black' onClick={() => setIsAlertOpen(false)}>ปิด</Button>
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default Login;
